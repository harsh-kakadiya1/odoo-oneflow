import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Trash2, Image } from 'lucide-react';

const TaskCardMenu = ({ onEdit, onDelete, onChangeCover }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (action) => {
    setIsOpen(false);
    if (action === 'edit') {
      onEdit();
    } else if (action === 'delete') {
      onDelete();
    } else if (action === 'changeCover') {
      onChangeCover();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Task actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
          <button
            onClick={() => handleMenuClick('edit')}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          
          <button
            onClick={() => handleMenuClick('changeCover')}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Image className="w-4 h-4" />
            Change Cover
          </button>
          
          <hr className="my-1 border-gray-200" />
          
          <button
            onClick={() => handleMenuClick('delete')}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCardMenu;
