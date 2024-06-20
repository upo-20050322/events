'use strict';

export default function renderLogs() {
    return `
        <div class="container-xxl mt-5">
            <h1>Logs</h1>
            <br>
            <div id="logs" class="border p-3 bg-dark text-white scrollable-div-lg overflow-auto border rounded"></div>
        </div>
    `
}