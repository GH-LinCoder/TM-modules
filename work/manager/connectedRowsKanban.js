import { addManagedListener } from '../../utils/listenerManagement.js';
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import {getDelayVisual} from '../../utils/getDelayVisual.js';

const CONFIRMATION_TIMEOUT = 10000;
const DESCRIPTION_LIMIT = 30;

let delayFactorChosen = 8; //organisations to determine for themselves how much delay is okay, or too long 

export const connectedCardThemes = {
    task: {
        unconfirmed: 'bg-blue-50 border-blue-200 rounded-l-2xl',
        confirmed: 'bg-blue-50 border-blue-200 rounded-l-2xl'
    },
    survey: {
        unconfirmed: 'bg-yellow-50 border-yellow-200 rounded-r-2xl',
        confirmed: 'bg-yellow-50 border-yellow-200 rounded-r-2xl'
    },
    approSubject: {
        unconfirmed: 'bg-blue-50 border-blue-200 rounded',
        confirmed: 'bg-blue-50 border-blue-200 rounded'
    },
    approObject: {
        unconfirmed: 'bg-purple-50 border-purple-200 rounded',
        confirmed: 'bg-purple-50 border-purple-200 rounded'
    }
};

function escapeHtml(value) {
    console.log('escapeHTML');
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getDelayMinutes(createdAt, confirmedAt) {
    console.log('getDelayMinutes');
    if (!createdAt || confirmedAt) return null;
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return null;
    return Math.max(0, (Date.now() - created.getTime()) / 60000);
}
/*
function getDelayVisual(minutes) {
    console.log('getDelayVisual');
    if (minutes === null) return '';
    const adjustedMinutes = minutes / delayFactorChosen;
    const logTime = Math.log(adjustedMinutes + 1);
    let borderWidth = Math.round(logTime) - 5;
    borderWidth = Math.max(1, Math.min(10, borderWidth));
console.log('logTime',logTime);
//    if (logTime < 4.09) return `border-green-300 border-[${borderWidth}px]`;//60mins
//    if (logTime < 4.80) return `border-green-400 border-[${borderWidth}px]`; //2hrs
//    if (logTime < 5.19) return `border-green-500 border-[${borderWidth}px]`;//3hrs
    if (logTime < 5.48) return `border-green-300 border-[${borderWidth}px]`;//4 hrs if delayFactorChosen =1
    if (logTime < 5.70) return `border-green-400 border-[${borderWidth}px]`;//5 hrs
    if (logTime < 5.89) return `border-green-500 border-[${borderWidth}px]`;//6 hrs
    if (logTime < 6.04) return `border-yellow-300 border-[${borderWidth}px]`;//7 hrs
    if (logTime < 6.17) return `border-yellow-400 border-[${borderWidth}px]`;//8hrs
    
    if (logTime < 7.27) return `border-yellow-500 border-[${borderWidth}px]`;//1 day

    if (logTime < 8.37) return `border-orange-300 border-[${borderWidth}px]`;// 3 days
    if (logTime < 9.22) return `border-orange-400 border-[${borderWidth}px]`;// 1 week
    if (logTime < 9.91) return `border-orange-500 border-[${borderWidth}px]`;// 2 weeks
    
    if (logTime < 10.32) return `border-red-300 border-[${borderWidth}px]`;// 3 weeks
    if (logTime < 10.6) return `border-red-300 border-[${borderWidth}px]`;// 4 weeks
    return `border-red-900 border-[${borderWidth}px] animate-pulse`;
}*/

function cellId(side, confirmed) {
    console.log('cellId');
    return `${confirmed ? 'confirmed' : 'unconfirmed'}-${side === 'subject' ? 'left' : 'right'}`;
}

function cardId(card) {
    console.log('cardId');
    return `${card.key}-${card.side}`;
}

function renderDescription(description, className = 'text-xs text-gray-600') {
    console.log('renderDescription');
    const fullText = String(description ?? '');
    const shortText = fullText.length > DESCRIPTION_LIMIT
        ? `${fullText.substring(0, DESCRIPTION_LIMIT)}...`
        : fullText;
    const moreButton = fullText.length > DESCRIPTION_LIMIT
        ? '<button type="button" class="toggle-desc text-blue-600 hover:underline text-xs ml-1">more</button>'
        : '';

    return `<p class="${className} card-desc" data-full="${escapeHtml(fullText)}">${escapeHtml(shortText)} ${moreButton}</p>`;
}

function renderCard(card) {
    console.log('renderCard');
    const confirmed = Boolean(card.confirmed);
    const delayMinutes = getDelayMinutes(card.createdAt, confirmed ? true : card.confirmedAt);
    const delayClass = getDelayVisual(delayMinutes, delayFactorChosen); // delayFactor of 8 means only start signalling at 8 hrs delay
    const draggable = confirmed ? '' : ' draggable="true"';
    const interactionClass = confirmed ? 'opacity-75 cursor-not-allowed' : 'cursor-move hover:shadow-md';
    const waitingText = delayMinutes === null ? '' : `Waiting: ${Math.round(delayMinutes / 60)}h`;

    return `
        <article class="connected-card self-start w-fit max-w-[18rem] ${confirmed ? card.theme.confirmed : card.theme.unconfirmed} ${interactionClass} ${delayClass} px-2 py-1 text-xs transition-shadow"
            data-card-id="${escapeHtml(cardId(card))}"
            data-card-key="${escapeHtml(card.key)}"
            data-side="${escapeHtml(card.side)}"
            data-confirmation-action="${escapeHtml(card.confirmationAction || '')}"
            data-confirmation-id="${escapeHtml(card.confirmationPayload?.assignmentId || card.confirmationPayload?.relationId || '')}"
            data-theme-unconfirmed="${escapeHtml(card.theme.unconfirmed)}"
            data-theme-confirmed="${escapeHtml(card.theme.confirmed)}"
            data-confirmed="${confirmed ? 'true' : 'false'}"
            ${draggable}
            title="${escapeHtml(`${confirmed ? 'Confirmed' : 'Drag to confirm'}${waitingText ? ` (${waitingText})` : ''}`)}">
            <div class="font-semibold text-gray-900">${escapeHtml(card.name || card.id || 'Unnamed appro')}
            <span class="text-[8px] text-gray-500 break-all">${escapeHtml(card.id || '')}</span></div>
            ${card.tuplet ? `<div class="mt-1 text-xs font-medium text-gray-700 ">${escapeHtml(card.tuplet)}</div>` : ''}
            ${card.relatedName ? `<div class="mt-1 text-xs text-gray-700">${escapeHtml(card.relatedName)}</div>` : ''}
            ${renderDescription(card.description)}
            ${card.relatedDescription !== undefined ? renderDescription(card.relatedDescription, 'text-xs text-gray-600 mt-1') : ''}
            ${card.roles?.length ? `<div class="mt-1 text-xs text-gray-500">Roles: ${escapeHtml(card.roles.join(', '))}</div>` : ''}
        </article>
    `;
}

function renderCell(id, heading, cards, style) {
    console.log('renderCell');
    return `
        <section id="${id}" class="connected-kanban-cell min-h-[140px] ${style} rounded border border-gray-200 bg-gray-50 p-3" data-cell-id="${id}">
            <h3 class="mb-2 text-sm font-semibold text-gray-700">${heading}</h3>
            <div class="connected-cards flex min-h-[80px] flex-wrap content-start items-start gap-2">
                ${cards.length ? cards.map(renderCard).join('') : '<p class="empty-cell text-xs italic text-gray-400">No connected items</p>'}
            </div>
        </section>
    `;
}

function renderBoard(cards, title, closureName) {//closureName is the name of the module that is open. A click on this closes the module via the 2nd click petition system
    console.log('renderBoard');
    const cells = {
        'unconfirmed-left': [],
        'unconfirmed-right': [],
        'confirmed-left': [],
        'confirmed-right': []
    };

    cards.forEach(card => cells[cellId(card.side, Boolean(card.confirmed))].push(card));

    return `
        <div class="connected-kanban p-2 md:p-4">
            <div class="mb-4 flex items-center justify-between gap-3">
                <h2 class="text-xl font-bold text-gray-800">${escapeHtml(title)}</h2>

 <button data-action=${closureName} class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

                <span class="text-xs text-gray-500">${cards.length} connection${cards.length === 1 ? '' : 's'}</span>
            </div>
            <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                <div class="flex min-w-0 flex-col gap-4">
                    ${renderCell('unconfirmed-left', 'I am the subject', cells['unconfirmed-left'],'bg-orange-100')}
                    ${renderCell('confirmed-left', 'I have confirmed as the subject', cells['confirmed-left'],'bg-green-100')}
                </div>
                <div class="flex min-w-0 flex-col gap-4">
                    ${renderCell('unconfirmed-right', 'I am managing', cells['unconfirmed-right'], 'bg-red-100')}
                    ${renderCell('confirmed-right', 'I have confirmed as manager', cells['confirmed-right'], 'bg-green-100')}
                </div>
            </div>
        </div>
    `;
}

function restoreCard(card, originCell) {
    console.log('restoreCard');
    const target = originCell.querySelector('.connected-cards');
    if (card.parentElement) card.parentElement.removeChild(card);
    target.appendChild(card);
    card.draggable = true;
    card.dataset.confirmed = 'false';
    card.classList.remove('bg-yellow-200', 'border-yellow-500', 'border-2', 'animate-pulse', 'opacity-75', 'cursor-pointer', 'cursor-not-allowed');
    card.dataset.themeConfirmed.split(' ').forEach(className => card.classList.remove(className));
    card.dataset.themeUnconfirmed.split(' ').forEach(className => card.classList.add(className));
    card.classList.add('cursor-move', 'hover:shadow-md');
    card.querySelector('.confirm-card')?.remove();
}

async function confirmCard(card, timeoutId, originCell) {
    console.log('confirmCard');
    clearTimeout(timeoutId);
    try {
        const action = card.dataset.confirmationAction;
        const id = card.dataset.confirmationId;
        if (!action || !id || !appState.query.userId) {
            throw new Error('Missing confirmation action, row ID, or user ID');
        }

        const payloadKey = action === 'confirmApproConnection' ? 'relationId' : 'assignmentId';
      
        const payload = { [payloadKey]: id, side: card.dataset.side };
      console.log('action:',action, ' payload:', payload);  
        
        await executeIfPermitted(appState.query.userId, action, payload);

        card.dataset.confirmed = 'true';
        card.draggable = false;
        card.classList.remove('bg-yellow-200', 'border-yellow-500', 'border-2', 'animate-pulse', 'cursor-pointer', 'cursor-move', 'hover:shadow-md');
        card.dataset.themeUnconfirmed.split(' ').forEach(className => card.classList.remove(className));
        card.dataset.themeConfirmed.split(' ').forEach(className => card.classList.add(className));
        card.classList.add('opacity-75', 'cursor-not-allowed');
        card.querySelector('.confirm-card')?.remove();
    } catch (error) {
        console.error('connectedRowsKanban: failed to confirm card', error);
        restoreCard(card, originCell);
    }
}

function addListeners(panel, controller) {
    console.log('addListeners');
    const timers = new Set();
    const clearTimers = () => {
        timers.forEach(clearTimeout);
        timers.clear();
    };
    controller.signal.addEventListener('abort', clearTimers, { once: true });

    panel.querySelectorAll('.toggle-desc').forEach(button => {
        addManagedListener(button, 'click', event => {
            event.stopPropagation();
            const description = button.closest('.card-desc');
            const fullText = description.dataset.full || '';
            const expanded = button.textContent === 'less';
            description.firstChild.textContent = `${expanded ? fullText.substring(0, DESCRIPTION_LIMIT) + (fullText.length > DESCRIPTION_LIMIT ? '...' : '') : fullText} `;
            button.textContent = expanded ? 'more' : 'less';
        }, controller);
    });

    const cells = panel.querySelectorAll('.connected-kanban-cell');
    const sideForCell = cell => cell.id.endsWith('-left') ? 'subject' : 'object';
    panel.querySelectorAll('.connected-card[draggable="true"]').forEach(card => {
        addManagedListener(card, 'dragstart', event => {
            event.dataTransfer.setData('application/json', JSON.stringify({
                cardId: card.dataset.cardId,
                side: card.dataset.side,
                originCell: card.closest('.connected-kanban-cell').id
            }));
            event.dataTransfer.effectAllowed = 'move';
            card.classList.add('opacity-50', 'border-dashed', 'border-gray-400');
        }, controller);

        addManagedListener(card, 'dragend', () => {
            card.classList.remove('opacity-50', 'border-dashed', 'border-gray-400');
            cells.forEach(cell => cell.classList.remove('bg-blue-50', 'border-blue-300', 'border-dashed'));
        }, controller);
    });

    cells.forEach(cell => {
        addManagedListener(cell, 'dragover', event => {
            const rawData = event.dataTransfer.getData('application/json');
            if (!rawData) return;
            const data = JSON.parse(rawData);
            const valid = data.side === sideForCell(cell) && data.originCell.startsWith('unconfirmed-') && cell.id.startsWith('confirmed-');
            event.preventDefault();
            event.dataTransfer.dropEffect = valid ? 'move' : 'none';
            cell.classList.toggle('bg-blue-50', valid);
            cell.classList.toggle('border-blue-300', valid);
            cell.classList.toggle('border-dashed', valid);
        }, controller);

        addManagedListener(cell, 'dragleave', () => {
            cell.classList.remove('bg-blue-50', 'border-blue-300', 'border-dashed');
        }, controller);

        addManagedListener(cell, 'drop', event => {
            event.preventDefault();
            cell.classList.remove('bg-blue-50', 'border-blue-300', 'border-dashed');
            const rawData = event.dataTransfer.getData('application/json');
            if (!rawData) return;
            const data = JSON.parse(rawData);
            const valid = data.side === sideForCell(cell) && data.originCell.startsWith('unconfirmed-') && cell.id.startsWith('confirmed-');
            if (!valid) return;

            const card = panel.querySelector(`[data-card-id="${CSS.escape(data.cardId)}"]`);
            const originCell = panel.querySelector(`#${CSS.escape(data.originCell)}`);
            if (!card || !originCell) return;
            cell.querySelector('.empty-cell')?.remove();
            cell.querySelector('.connected-cards').appendChild(card);
            card.classList.remove('cursor-move', 'hover:shadow-md', 'opacity-50', 'border-dashed', 'border-gray-400');
            card.classList.add('bg-yellow-200', 'border-yellow-500', 'border-2', 'cursor-pointer', 'animate-pulse');
            card.draggable = false;
            const confirmText = document.createElement('span');
            confirmText.className = 'confirm-card block text-xs font-bold text-yellow-800 mt-1 text-center';
            confirmText.textContent = 'Click to confirm classification';
            card.appendChild(confirmText);

            const handleConfirm = () => confirmCard(card, timeoutId, originCell);
            const timeoutId = setTimeout(() => {
                timers.delete(timeoutId);
                card.removeEventListener('click', handleConfirm);
                restoreCard(card, originCell);
            }, CONFIRMATION_TIMEOUT);
            timers.add(timeoutId);
            addManagedListener(card, 'click', handleConfirm, controller, { once: true });
        }, controller);
    });
}

export function renderConnectedKanban(panel, cards, controller, title, closureName) {
    console.log('renderConnectedKanban');
    const activeController = controller || new AbortController();
    panel.innerHTML = renderBoard(cards, title, closureName);
    addListeners(panel, activeController);
}
