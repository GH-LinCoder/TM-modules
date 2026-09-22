// ../work/manager/displayConnectedSurveys.js
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { connectedCardThemes, renderConnectedKanban } from './connectedRowsKanban.js';

console.log('../work/manager/displayConnectedSurveys.js loaded');

export let surveyRows = [];

function firstValue(row, names) {
    return names.map(name => row[name]).find(value => value !== undefined && value !== null && value !== '') || '';
}

function toCards(rows) {
    return rows.flatMap(({ row, metadata }) => {
        const matches = metadata.typeOfMatch || [];
        const cards = [];
        const roles = ['assigned_manager', 'default_manager', 'author'].filter(role => matches.includes(role));
        const surveyName = firstValue(row, ['survey_name', 'name']);
        const surveyDescription = firstValue(row, ['survey_description', 'description']);
        const subjectDescription = firstValue(row, ['student_description', 'student_appro_description', 'approfile_description', 'student_desc']);
        const objectDescription = firstValue(row, ['manager_description', 'default_manager_description', 'author_description']);

        if (matches.includes('student')) {
            cards.push({
                key: row.assignment_id,
                side: 'subject',
                theme: connectedCardThemes.survey,
                name: firstValue(row, ['student_name', 'student_id']),
                id: row.student_id,
                description: subjectDescription,
                relatedName: surveyName,
                relatedDescription: surveyDescription,
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
                theme: connectedCardThemes.survey,
                name: firstValue(row, ['manager_name', 'default_manager_name', 'author_name', 'manager_id', 'default_manager_id', 'author_id']),
                id: firstValue(row, ['manager_id', 'default_manager_id', 'author_id']),
                description: objectDescription,
                relatedName: surveyName,
                relatedDescription: surveyDescription,
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

async function loadConnectedSurveyRows(query = {}) {
    const userId = query.userId || appState.query.userId;
    if (!userId) {
        surveyRows = [];
        console.warn('displayConnectedSurveys: no user ID is available');
        console.log('surveyRows', surveyRows);
        return surveyRows;
    }

    const rows = await executeIfPermitted(userId, 'readConnectedSurveyRows');
    surveyRows = rows.flatMap(row => {
        const typeOfMatch = [];
        if (row.student_id === userId) typeOfMatch.push('student');
        if (row.manager_id === userId) typeOfMatch.push('assigned_manager');
        if (row.default_manager_id === userId) typeOfMatch.push('default_manager');
        if (row.author_id === userId) typeOfMatch.push('author');

        return typeOfMatch.length > 0 ? [{ row, metadata: { typeOfMatch } }] : [];
    });

    console.log('surveyRows', surveyRows);
    return surveyRows;
}

export async function render(panel, query = {}, controller) {
    console.log('displayConnectedSurveys.js render()');
    const displayArea = panel || document.querySelector(`[data-section="display-area"]`);
    if (!displayArea) {
        console.error('displayConnectedSurveys: no render panel is available');
        return;
    }
    displayArea.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading display-area...</div>';

    try {
        const rows = await loadConnectedSurveyRows(query);
        if (controller?.signal.aborted || !displayArea.isConnected) return;
        renderConnectedKanban(displayArea, toCards(rows), controller, 'Connected surveys');
    } catch (error) {
        surveyRows = [];
        console.error('displayConnectedSurveys: failed to load rows', error);
        displayArea.innerHTML = '<p class="p-4 text-red-600">Unable to load connected surveys.</p>';
    }
}