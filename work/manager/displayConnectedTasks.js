// ../work/manager/displayConnectedTasks.js
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { connectedCardThemes, renderConnectedKanban } from './connectedRowsKanban.js';

console.log('../work/manager/displayConnectedTasks.js loaded');

export let taskRows = [];

function firstValue(row, names) {
    return names.map(name => row[name]).find(value => value !== undefined && value !== null && value !== '') || '';
}

function toCards(rows) {
    return rows.flatMap(({ row, metadata }) => {
        const matches = metadata.typeOfMatch || [];
        const cards = [];
        const roles = ['assigned_manager', 'default_manager', 'author'].filter(role => matches.includes(role));
        const taskName = firstValue(row, ['task_name', 'name']);
        const taskDescription = firstValue(row, ['task_description', 'description']);
        const subjectDescription = firstValue(row, ['student_description', 'student_appro_description', 'approfile_description', 'student_desc']);
        const objectDescription = firstValue(row, ['manager_description', 'default_manager_description', 'author_description']);

        if (matches.includes('student')) {
            cards.push({
                key: row.assignment_id,
                side: 'subject',
                theme: connectedCardThemes.task,
                name: firstValue(row, ['student_name', 'student_id']),
                id: row.student_id,
                description: subjectDescription,
                relatedName: taskName,
                relatedDescription: taskDescription,
                confirmed: Boolean(row.confirmed_is_at),
                confirmedAt: row.confirmed_is_at,
                createdAt: row.created_at,
                confirmationAction: 'confirmAssignmentConnection',
                confirmationPayload: { assignmentId: row.assignment_id }
            });
        }

        if (roles.length) {
            cards.push({
                key: row.assignment_id,
                side: 'object',
                theme: connectedCardThemes.task,
                name: firstValue(row, ['manager_name', 'default_manager_name', 'author_name', 'manager_id', 'default_manager_id', 'author_id']),
                id: firstValue(row, ['manager_id', 'default_manager_id', 'author_id']),
                description: objectDescription,
                relatedName: taskName,
                relatedDescription: taskDescription,
                roles,
                confirmed: Boolean(row.confirmed_of_at),
                confirmedAt: row.confirmed_of_at,
                createdAt: row.created_at,
                confirmationAction: 'confirmAssignmentConnection',
                confirmationPayload: { assignmentId: row.assignment_id }
            });
        }

        return cards;
    });
}

async function loadConnectedTaskRows(query = {}) {
    const userId = query.userId || appState.query.userId;
    if (!userId) {
        taskRows = [];
        console.warn('displayConnectedTasks: no user ID is available');
        console.log('taskRows', taskRows);
        return taskRows;
    }

    const rows = await executeIfPermitted(userId, 'readConnectedTaskRows');
    taskRows = rows.flatMap(row => {
        const typeOfMatch = [];
        if (row.student_id === userId) typeOfMatch.push('student');
        if (row.manager_id === userId) typeOfMatch.push('assigned_manager');
        if (row.default_manager_id === userId) typeOfMatch.push('default_manager');
        if (row.author_id === userId) typeOfMatch.push('author');

        return typeOfMatch.length > 0 ? [{ row, metadata: { typeOfMatch } }] : [];
    });

    console.log('taskRows', taskRows);
    return taskRows;
}

export async function render(panel, query = {}, controller) {
    console.log('displayConnectedTasks.js render()');
    const displayArea = panel || document.querySelector(`[data-section="display-area"]`);
    if (!displayArea) {
        console.error('displayConnectedTasks: no render panel is available');
        return;
    }
    displayArea.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading display-area...</div>';

    try {
        const rows = await loadConnectedTaskRows(query);
        if (controller?.signal.aborted || !displayArea.isConnected) return;
        renderConnectedKanban(displayArea, toCards(rows), controller, 'Connected tasks');
    } catch (error) {
        taskRows = [];
        console.error('displayConnectedTasks: failed to load rows', error);
        displayArea.innerHTML = '<p class="p-4 text-red-600">Unable to load connected tasks.</p>';
    }
}