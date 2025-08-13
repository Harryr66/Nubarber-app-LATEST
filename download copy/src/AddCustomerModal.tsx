import React from 'react';
import { useForm } from 'react-hook-form';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface AddCustomerModalProps {
  onClose: () => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'customers'), {
          ...data,
          businessId: user.uid,
        });
        onClose();
      }
    } catch (error) {
      console.error('Add customer error:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2 className="text-xl mb-4">Add New Customer</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('name', { required: true })}
            placeholder="Full Name"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.name && <span className="text-red-500 text-sm">Required</span>}
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Email Address"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          {errors.email && <span className="text-red-500 text-sm">Required</span>}
          <input
            {...register('phone')}
            placeholder="Phone Number"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          <textarea
            {...register('notes')}
            placeholder="Notes (Optional)"
            className="block w-full mb-2 p-2 bg-gray-700 rounded"
          />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-white text-black px-4 py-2 rounded">Add Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;