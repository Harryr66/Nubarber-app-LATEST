import React from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FormData {
  name: string;
  email: string;
  password: string;
  title: string;
  photo: string;  // Optional
}

interface AddStaffModalProps {
  onClose: () => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'staff'), {
          ...data,
          businessId: user.uid,
        });
        onClose();
      }
    } catch (error) {
      console.error('Add staff error:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2 className="text-xl mb-4">Add New Staff Member</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('name', { required: true })}
            placeholder="Name"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.name && <span className="text-red-500 text-sm">Required</span>}
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Email"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.email && <span className="text-red-500 text-sm">Required</span>}
          <input
            {...register('password', { required: true })}
            type="password"
            placeholder="Password"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.password && <span className="text-red-500 text-sm">Required</span>}
          <input
            {...register('title', { required: true })}
            placeholder="Title"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.title && <span className="text-red-500 text-sm">Required</span>}
          <input
            {...register('photo')}
            placeholder="Profile Image (Optional)"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-white text-black px-4 py-2 rounded">Add Staff Member</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;