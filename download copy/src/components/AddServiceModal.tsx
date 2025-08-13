import React from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FormData {
  name: string;
  description: string;
  price: number;
  duration: number;
}

const AddServiceModal = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'services'), {
          ...data,
          businessId: user.uid,
        });
        onClose();
      }
    } catch (error) {
      console.error('Add service error:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2 className="text-xl mb-4">Add New Service</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('name', { required: true })}
            placeholder="Service Name"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.name && <span className="text-red-500 text-sm">Required</span>}
          <textarea
            {...register('description')}
            placeholder="Description (Optional)"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          <div className="flex gap-2 mb-2">
            <input
              {...register('price', { required: true, valueAsNumber: true })}
              type="number"
              placeholder="Price ($)"
              className="w-1/2 p-2 bg-gray-700 rounded"
            />
            <input
              {...register('duration', { required: true, valueAsNumber: true })}
              type="number"
              placeholder="Duration (minutes)"
              className="w-1/2 p-2 bg-gray-700 rounded"
            />
          </div>
          {(errors.price || errors.duration) && <span className="text-red-500 text-sm">Required</span>}
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-white text-black px-4 py-2 rounded">Add Service</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;