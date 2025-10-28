const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const todayDate = new Date().toISOString().split('T')[0];
const baseLogDir = path.join(__dirname, 'logs', todayDate);

const services = ['sprintopn', 'sprintverify', 'sprintnxt'];
const sprintverifyapis = ['pennydrop', 'pennyless', 'ip_geo_lookup', 'aadhaarverify', 'voterverify'];
const sprintopnapis = ['auth', 'statuscheck'];

// --- STEP 1: Create Folder Structure ---
function create_logs_structure() {
  if (!fs.existsSync(baseLogDir)) {
    fs.mkdirSync(baseLogDir, { recursive: true });
  }

  services.forEach(service => {
    const serviceDir = path.join(baseLogDir, service);
    if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir);

    if (service === 'sprintverify') {
      sprintverifyapis.forEach(api => {
        const apiDir = path.join(serviceDir, api);
        if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
      });
    }

    if (service === 'sprintopn') {
      sprintopnapis.forEach(api => {
        const apiDir = path.join(serviceDir, api);
        if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);
      });
    }
  });

  console.log(`✅ Folder structure created under: ${baseLogDir}`);
}

// --- STEP 2: Generate Random Intervals (with counts) ---
function generateIntervalPool() {
  return {
    short: { count: 7, min: 100, max: 1500 },
    avg: { count: 5, min: 2000, max: 4500 },
    long: { count: 2, min: 5000, max: 10000 }
  };
}

// Function to pick a random interval and decrease its count
function getNextInterval(pool) {
  const availableTypes = Object.keys(pool).filter(k => pool[k].count > 0);

  // if no intervals left, regenerate
  if (availableTypes.length === 0) {
    console.log('♻️  Regenerating interval pool...');
    Object.assign(pool, generateIntervalPool());
    return getNextInterval(pool);
  }

  const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const { min, max } = pool[randomType];
  const value = Math.floor(Math.random() * (max - min + 1)) + min;

  pool[randomType].count--;
  return value;
}

// --- STEP 3: Generate Logs Sequentially ---
function generate_logs(sourceFile , service, apiname) {
  const apiLogDir = path.join(baseLogDir, service, apiname);
  const outputFile = path.join(apiLogDir, 'logs.log');

  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Log file ${sourceFile} not found.`);
    return;
  }

  if (!fs.existsSync(apiLogDir)) fs.mkdirSync(apiLogDir, { recursive: true });

  console.log(`📖 Reading logs from: ${sourceFile}`);

  const logfiledata = fs.readFileSync(sourceFile, 'utf-8');
  const logLines = logfiledata.split('\n').filter(Boolean);

  const intervalPool = generateIntervalPool();

  console.log(`🕒 Starting log generation with dynamic intervals...`);

  let index = 0;

  function writeNextLog() {
    if (index >= logLines.length) {
      console.log(`✅ All logs written to: ${outputFile}`);
      return;
    }

    const line = logLines[index];
    fs.appendFileSync(outputFile, line + '\n', 'utf-8');
    console.log(`📝 Log ${index + 1}/${logLines.length} written at ${new Date().toISOString()}`);

    const delay = getNextInterval(intervalPool);
    index++;

    setTimeout(writeNextLog, delay);
  }

  writeNextLog();
}

// --- RUN EVERYTHING ---
create_logs_structure();


generate_logs('Pennydroppipe5.log', 'sprintverify', 'pennydrop');
generate_logs('ip_geo_lookupfile.log', 'sprintverify', 'ip_geo_lookup');
generate_logs('voter_verify.log', 'sprintverify', 'voterverify');
generate_logs('pennyless.log', 'sprintverify', 'pennyless');
generate_logs('aadhaar_verify_otp.log', 'sprintverify', 'aadhaarverify');




