const fs = require('fs');
const path = require('path');

// --- Utility functions ---
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function appendLog(logPath, content) {
    fs.appendFileSync(logPath, content);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function randomIp() {
    return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`;
}

function getTimestamp() {
    const date = new Date();
    return date.toISOString().replace('T', ' ').split('.')[0];
}

function randomBankName() {
    const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'PNB'];
    return banks[randomInt(0, banks.length - 1)];
}

function randomBranchName() {
    const branches = ['DOMJUR', 'MUMBAI', 'DELHI', 'KOLKATA', 'CHENNAI'];
    return branches[randomInt(0, branches.length - 1)];
}

function randomCity() {
    const cities = ['Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'Bangalore'];
    return cities[randomInt(0, cities.length - 1)];
}

// --- Pennyless Log Generator ---
function generatePennylessLog() {
    const requestId = `${randomInt(10000000, 99999999)}`;
    return {
        date: getTimestamp(),
        request: `RESPONSE-${Date.now()}-${requestId}`,
        data: {
            code: 200,
            status: "success",
            message: "Success",
            request_id: requestId,
            response: {
                account_details: {
                    beneficiary_name: `Mr ${randomString(6)}`,
                    beneficiary_account: `${randomInt(10000000000, 99999999999)}`,
                    beneficiary_ifsc: `SBIN${randomInt(1000, 9999)}`,
                    bank_name: randomBankName(),
                    branch_name: randomBranchName()
                },
                message: "Bank Account details verified successfully",
                created_at: Math.floor(Date.now() / 1000),
                newcode: "00"
            },
            timestamp: `${getTimestamp()} 05:30`
        }
    };
}

// --- IP Lookup Log Generator ---
function generateIPLookupLog() {
    const requestId = `${randomInt(10000000, 99999999)}`;
    const ip = randomIp();
    return {
        date: getTimestamp(),
        request: `RESPONSE-${Date.now()}-${requestId}`,
        data: {
            code: 200,
            status: "success",
            message: "Success",
            request_id: requestId,
            response: {
                request_id: requestId,
                ip,
                type: "IPv4",
                continent_code: "AS",
                continent_name: "Asia",
                country_code: "IN",
                country_name: "India",
                region_code: "WB",
                region_name: "West Bengal",
                city: randomCity(),
                zip: `${randomInt(100000, 999999)}`,
                latitude: 22.5 + Math.random(),
                longitude: 88.3 + Math.random(),
                radius: randomInt(100, 300),
                location: {
                    geoname_id: randomInt(1000000, 2000000),
                    capital: "New Delhi",
                    languages: [
                        { code: "eng", name: "English", native: "English" },
                        { code: "hin", name: "Hindi", native: "Hindi" }
                    ],
                    country_flag: "https://flagcdn.com/in.svg",
                    country_flag_emoji: "🇮🇳",
                    country_flag_emoji_unicode: "U 1F1EE U 1F1F3",
                    calling_code: "91",
                    is_eu: false
                },
                timezone: {
                    id: "Asia/Kolkata",
                    abbr: "IST",
                    is_dst: false,
                    gmt_offset: 19800,
                    utc: "05:30",
                    current_time: `${getTimestamp()} 05:30`
                },
                currency: {
                    code: "INR",
                    name: "Indian rupee",
                    plural: "",
                    symbol: "Rs",
                    symbol_native: "Rs"
                },
                connection: {
                    asn: `AS${randomInt(10000, 99999)}`,
                    isp: "Bharti Airtel Ltd."
                },
                security: {
                    anonymous: false,
                    proxy: false,
                    vpn: false,
                    tor: false,
                    hosting: false,
                    service_type: "",
                    service: ""
                },
                ipRoutingType: "fixed",
                connectionType: "tx"
            },
            timestamp: `${getTimestamp()} 05:30`
        }
    };
}

// --- Generic Log Generator ---
function generateGenericLog(apiName) {
    return {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Random log for ${apiName}`,
        status: 200,
        userId: randomInt(1, 999),
        info: {
            ip: randomIp(),
            sessionId: randomString(12),
            action: 'access',
            details: {
                browser: 'Chrome',
                os: 'Windows',
                location: randomCity()
            }
        }
    };
}

// --- Main Log Generation ---
const baseLogDir = path.join(__dirname, 'logs');
const services = {
    sprintverify: ['pennydrop', 'pennyless', 'iplookupapi', 'panverify', 'adharverify'],
    sprintopn: ['auth', 'statuscheck']
};

function generateLogs() {
    const dateFolder = new Date().toISOString().split('T')[0];

    Object.entries(services).forEach(([service, apis]) => {
        apis.forEach(api => {
            let payload;
            if (api === 'pennyless') {
                payload = generatePennylessLog();
            } else if (api === 'iplookupapi') {
                payload = generateIPLookupLog();
            } else {
                payload = generateGenericLog(api);
            }

            const logDir = path.join(baseLogDir, dateFolder, service, api);
            ensureDir(logDir);
            const logFile = path.join(logDir, 'logs.log');

            appendLog(logFile, JSON.stringify(payload) + '\n');
        });
    });

    console.log(`[${new Date().toISOString()}] Logs generated.`);
}

// --- Interval-based Log Generation ---
function startLogGenerator(logsPerSecond = 5, intervalMs = 5000) {
    setInterval(() => {
        for (let i = 0; i < logsPerSecond; i++) {
            generateLogs();
        }
    }, intervalMs);
}

// Start
startLogGenerator(25000, 1000); // Change as needed
