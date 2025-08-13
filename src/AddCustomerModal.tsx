import { useForm } from 'react-hook-form';

interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

interface AddCustomerModalProps {
  onClose: () => void;
  onAdd: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
}

const AddCustomerModal = ({ onClose, onAdd, initialData = {} }: AddCustomerModalProps) => {
  const { register, handleSubmit } = useForm<CustomerFormData>({ defaultValues: initialData });

  const onSubmit = (data: CustomerFormData) => {
    onAdd(data);
  };

  return (
    <div className="bg-gray-800 p-6 rounded shadow-lg w-96 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Name" required className="w-full p-2 border rounded bg-gray-700" />
        <input {...register('email')} placeholder="Email" required className="w-full p-2 border rounded bg-gray-700" />
        <input {...register('phone')} placeholder="Phone" className="w-full p-2 border rounded bg-gray-700" />
        <input {...register('notes')} placeholder="Notes" className="w-full p-2 border rounded bg-gray-700" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Add Customer</button>
        <button type="button" onClick={onClose} className="bg-gray-500 text-white p-2 rounded w-full">Cancel</button>
      </form>
    </div>
  );
};

export default AddCustomerModal;