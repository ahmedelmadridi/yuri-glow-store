'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/app/actions/product';

export default function DeleteProductButton({ productId, productName }: { productId: number, productName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(`هل أنت متأكد من رغبتك في حذف المنتج: "${productName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`);
    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        alert('تم حذف المنتج بنجاح.');
        router.refresh();
      } else {
        alert('حدث خطأ أثناء الحذف: ' + result.error);
      }
    } catch (error) {
      alert('حدث خطأ غير متوقع');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{ 
        color: 'white', 
        backgroundColor: isDeleting ? '#e57373' : '#f44336', 
        border: 'none', 
        padding: '6px 12px', 
        borderRadius: '4px', 
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem'
      }}
    >
      {isDeleting ? 'جاري الحذف...' : 'حذف'}
    </button>
  );
}
