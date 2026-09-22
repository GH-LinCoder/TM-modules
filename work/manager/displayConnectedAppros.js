//../work/manager/displayConnectedAppros.js
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { connectedCardThemes, renderConnectedKanban } from './connectedRowsKanban.js';

console.log('../work/manager/displayConnectedAppros.js');

export let approRows = [];

function firstValue(row, names) {
    return names.map(name => row[name]).find(value => value !== undefined && value !== null && value !== '') || '';
}

function toCards(rows) {
    return rows.flatMap(({ row, metadata }) => {
        const cards = [];
        const matches = metadata.typeOfMatch || [];
        const subjectName = firstValue(row, ['approfile_is_name', 'approfile_is']);
        const objectName = firstValue(row, ['of_approfile_name', 'of_approfile']);
        const subjectDescription = firstValue(row, ['approfile_is_description', 'approfile_is_desc']);
        const objectDescription = firstValue(row, ['of_approfile_description', 'of_approfile_desc']);
        const relationship = firstValue(row, ['relationship', 'rel_name']);

        if (matches.includes('approfile_is')) {
            cards.push({
                key: row.relation_id,
                side: 'subject',
                theme: connectedCardThemes.approSubject,
                name: subjectName,
                id: row.approfile_is,
                description: subjectDescription,
                relatedName: objectName,
                relatedDescription: objectDescription,
                tuplet: `[${subjectName}]-[${relationship}]-[${objectName}]`,
                confirmed: Boolean(row.confirmed_is_at),
                confirmedAt: row.confirmed_is_at,
                createdAt: row.created_at,
                confirmationAction: 'confirmApproConnection',
                confirmationPayload: { relationId: row.relation_id }
            });
        }

        if (matches.includes('of_approfile')) {
            cards.push({
                key: row.relation_id,
                side: 'object',
                theme: connectedCardThemes.approObject,
                name: objectName,
                id: row.of_approfile,
                description: objectDescription,
                relatedName: subjectName,
                relatedDescription: subjectDescription,
                tuplet: `[${subjectName}]-[${relationship}]-[${objectName}]`,
                confirmed: Boolean(row.confirmed_of_at),
                confirmedAt: row.confirmed_of_at,
                createdAt: row.created_at,
                confirmationAction: 'confirmApproConnection',
                confirmationPayload: { relationId: row.relation_id }
            });
        }

        return cards;
    });
}

async function loadConnectedApproRows(query = {}) {
    const userId = query.userId || appState.query.userId;
    if (!userId) {
        approRows = [];
        console.warn('displayConnectedAppros: no user ID is available');
        console.log('approRows', approRows);
        return approRows;
    }

    const rows = await executeIfPermitted(userId, 'readConnectedApproRows', {
        approfileId: userId
    });
    approRows = rows.flatMap(row => {
        const typeOfMatch = [];
        if (row.approfile_is === userId) typeOfMatch.push('approfile_is');
        if (row.of_approfile === userId) typeOfMatch.push('of_approfile');

        return typeOfMatch.length > 0 ? [{ row, metadata: { typeOfMatch } }] : [];
    });

    console.log('approRows', approRows);
    return approRows;
}

export async function render(panel, query = {}, controller) {
    console.log('displayConnectedAppros.js render()');
    const displayArea = panel || document.querySelector(`[data-section="display-area"]`);
    if (!displayArea) {
        console.error('displayConnectedAppros: no render panel is available');
        return;
    }
    displayArea.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading display-area...</div>';

    try {
        const rows = await loadConnectedApproRows(query);
        if (controller?.signal.aborted || !displayArea.isConnected) return;
        renderConnectedKanban(displayArea, toCards(rows), controller, 'Connected appros');
    } catch (error) {
        approRows = [];
        console.error('displayConnectedAppros: failed to load rows', error);
        displayArea.innerHTML = '<p class="p-4 text-red-600">Unable to load connected appros.</p>';
    }
}