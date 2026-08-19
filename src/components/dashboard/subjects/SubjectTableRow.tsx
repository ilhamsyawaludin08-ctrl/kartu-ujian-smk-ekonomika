'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import SubjectFormModal from './SubjectFormModal';
import { deleteSubject } from '@/app/dashboard/subjects/actions';

export default function SubjectTableRow({ subject, index }: { subject: any, index: number }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      setIsDeleting(true);
      const res = await deleteSubject(subject.id);
      setIsDeleting(false);
      
      if (!res.success) {
        alert(res.error || 'Gagal menghapus mata pelajaran');
      }
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-500 text-center">{index + 1}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-gray-900">{subject.name}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-600">{subject.teacher_name || '-'}</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="p-2 text-gray-400 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      <SubjectFormModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        subject={subject}
      />
    </>
  );
}
