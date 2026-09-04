const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const StudyMaterial = require('../models/StudyMaterial');
const { pythonRequest } = require('../services/pythonService');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const materials = await StudyMaterial.find({}).select('_id userId courseId fileUrl fileName').lean();
  console.log(`[CHAT] Reindex starting documents=${materials.length}`);

  let succeeded = 0;
  let failed = 0;

  for (const material of materials) {
    if (!material.fileUrl) {
      console.log(`[CHAT] Skipping ${material._id} (no fileUrl)`);
      failed += 1;
      continue;
    }

    try {
      const response = await pythonRequest({
        method: 'post',
        path: '/upload-study-material',
        data: {
          user_id: material.userId.toString(),
          course_id: material.courseId.toString(),
          document_id: material._id.toString(),
          pdf_url: material.fileUrl,
        },
        timeout: 180000,
      });
      succeeded += 1;
      console.log(
        `[CHAT] Indexed document_id=${String(material._id).slice(0, 4)}... chunks=${response.data.chunks}`
      );
    } catch (error) {
      failed += 1;
      const detail = error.response?.data?.detail || error.message;
      console.error('[CHAT] Reindex failed for a document:', typeof detail === 'string' ? detail : 'error');
    }
  }

  console.log(`[CHAT] Reindex complete succeeded=${succeeded} failed=${failed}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('[CHAT] Reindex script failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    // ignore
  }
  process.exit(1);
});
