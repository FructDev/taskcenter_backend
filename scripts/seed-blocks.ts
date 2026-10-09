// scripts/seed-blocks.ts
// Run with: npx ts-node -r tsconfig-paths/register scripts/seed-blocks.ts
// Or compile and run with node

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || '';

if (!MONGO_URI) {
  console.error('❌ No se encontró MONGO_URI en .env');
  process.exit(1);
}

// Block definitions: [mainBlock, subBlocks]
// Names follow the Blk.XX.YY convention seen in the park technical drawing
const BLOCKS: { name: string; code: string }[] = [];

const blockSubcounts: [number, number][] = [
  [1, 6],
  [2, 10],
  [3, 4],
  [4, 6],
  [5, 6],
  [6, 8],
  [7, 6],
  [8, 6],
  [9, 6],
  [10, 8],
  [11, 6],
  [12, 9],
  [13, 8],
  [14, 6],
];

for (const [main, subCount] of blockSubcounts) {
  const mainStr = main.toString().padStart(2, '0');
  for (let sub = 1; sub <= subCount; sub++) {
    const subStr = sub.toString().padStart(2, '0');
    BLOCKS.push({
      name: `Blk.${mainStr}.${subStr}`,
      code: `BLK-${mainStr}-${subStr}`,
    });
  }
}

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, required: true },
  description: { type: String },
  coordinates: {
    lat: Number,
    lng: Number,
  },
  bounds: {
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number,
  },
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  const Location = mongoose.model('Location', LocationSchema);

  let created = 0;
  let skipped = 0;

  for (const block of BLOCKS) {
    const exists = await Location.findOne({ code: block.code });
    if (exists) {
      skipped++;
      continue;
    }
    await Location.create({
      name: block.name,
      code: block.code,
      type: 'block',
      description: `Bloque solar ${block.name} — Parque Solar Girasol`,
    });
    created++;
    console.log(`  ✔ ${block.name} (${block.code})`);
  }

  console.log(`\n🎉 Listo: ${created} bloques creados, ${skipped} ya existían.`);
  console.log('\n📝 Siguiente paso: Ve a Admin → Ubicaciones y dibuja el rectángulo de cada bloque.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
