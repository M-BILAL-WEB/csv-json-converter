// UI state management
let activeSection = null;

function showSection(sectionId) {
    if (activeSection) {
        document.getElementById(activeSection).classList.add('hidden');
    }
    document.getElementById(sectionId).classList.remove('hidden');
    activeSection = sectionId;
}

// Event Listeners
document.getElementById('convertCsvToJsonButton').addEventListener('click', function() {
    showSection('csvSection');
    document.getElementById('csvFile').click();
});

document.getElementById('convertJsonToCsvButton').addEventListener('click', function() {
    showSection('jsonSection');
});

document.getElementById('csvFile').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) {
        showToast('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const csvData = event.target.result;
            const jsonData = csvToJson(csvData);
            document.getElementById('jsonOutput').textContent = JSON.stringify(jsonData, null, 2);
            document.getElementById('downloadJsonButton').classList.remove('hidden');
            showToast('CSV successfully converted to JSON!');
        } catch (error) {
            showToast('Error parsing CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
});

document.getElementById('jsonFile').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) {
        showToast('Please select a JSON file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const jsonData = JSON.parse(event.target.result);
            const csvData = jsonToCsv(jsonData);
            document.getElementById('csvOutput').textContent = csvData;
            document.getElementById('downloadCsvButton').classList.remove('hidden');
            showToast('JSON successfully converted to CSV!');
        } catch (error) {
            showToast('Error parsing JSON file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
});

document.getElementById('convertButtonJsonToCsv').addEventListener('click', function() {
    const jsonText = document.getElementById('jsonInput').value;
    try {
        const jsonData = JSON.parse(jsonText);
        const csvData = jsonToCsv(jsonData);
        document.getElementById('csvOutput').textContent = csvData;
        document.getElementById('downloadCsvButton').classList.remove('hidden');
        showToast('JSON successfully converted to CSV!');
    } catch (error) {
        showToast('Error parsing JSON: ' + error.message, 'error');
    }
});

// Download handlers
document.getElementById('downloadJsonButton').addEventListener('click', function() {
    const jsonStr = document.getElementById('jsonOutput').textContent;
    downloadFile(jsonStr, 'converted.json', 'application/json');
});

document.getElementById('downloadCsvButton').addEventListener('click', function() {
    const csvStr = document.getElementById('csvOutput').textContent;
    downloadFile(csvStr, 'converted.csv', 'text/csv');
});

// Utility Functions
function csvToJson(csv) {
    const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',').map(item => item.trim());

        if (currentLine.length !== headers.length) {
            throw new Error(`Line ${i + 1} has incorrect number of values`);
        }

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        result.push(obj);
    }

    return result;
}

function jsonToCsv(json) {
    if (!Array.isArray(json) || !json.length) {
        throw new Error('Input must be a non-empty array of objects');
    }

    const headers = Object.keys(json[0]);
    const rows = [
        headers.join(','),
        ...json.map(obj =>
            headers.map(header => {
                let cell = obj[header] === null || obj[header] === undefined ? '' : obj[header];
                cell = typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
                return cell;
            }).join(',')
        )
    ];

    return rows.join('\n');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } transition-opacity duration-300`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}
