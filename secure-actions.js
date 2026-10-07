const fs = require('fs');
const path = require('path');

function injectAuth(filePath, mutatingFuncs) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { requireAdmin }")) {
    content = content.replace(/'use server';?/, "'use server';\n\nimport { requireAdmin } from '@/lib/auth';");
  }

  mutatingFuncs.forEach(func => {
    const regex = new RegExp(`(export async function ${func}\\([^{]*{)`, 'g');
    content = content.replace(regex, `$1\n  await requireAdmin();`);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// admin-content.ts
injectAuth(path.join(__dirname, 'src/app/actions/admin-content.ts'), [
  'addAnnouncement',
  'toggleAnnouncement',
  'deleteAnnouncement',
  'addBanner',
  'deleteBanner',
  'addScreenshotReview',
  'deleteScreenshotReview',
  'updateStoreSetting'
]);

// coupons.ts
injectAuth(path.join(__dirname, 'src/app/actions/coupons.ts'), [
  'addCoupon',
  'toggleCouponStatus',
  'deleteCoupon'
]);

// product.ts
injectAuth(path.join(__dirname, 'src/app/actions/product.ts'), [
  'addProduct',
  'updateProduct',
  'deleteProduct',
  'updateProductVisibility'
]);
