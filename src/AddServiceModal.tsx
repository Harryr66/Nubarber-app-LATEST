import { useForm } from 'react-hook-form';

interface ServiceFormData {
  name: string;
  duration: number;
  price: number;
}

interface AddServiceModalProps {
  onClose: () => void;
  onAdd: (data: ServiceFormData) => void;
  initialData?: Partial<ServiceFormData>;
}

const AddServiceModal = ({ onClose, onAdd, initialData = {} }: AddServiceModalProps) => {
  const { register, handleSubmit } = useForm<ServiceFormData>({ defaultValues: initialData });

  const onSubmit = (data: ServiceFormData) => {
    onAdd(data);
  };

  return (
    <div className="bg-gray-800 p-6 rounded shadow-lg w-96 text-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Service Name" required className="w-full p-2 border rounded bg-gray-700" />
        <input {...register('duration', { valueAsNumber: true })} placeholder="Duration (min)" type="number" required className="w-full p-2 border rounded bg-gray-700" />
        <input {...register('price', { valueAsNumber: true })} placeholder="Price" type="number" required className="w-full p-2 border rounded bg-gray-700" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Add Service</button>
        <button type="button" onClick={onClose} className="bg-gray-500 text-white p-2 rounded w-full">Cancel</button>
      </form>
    </div>
  );
};

export default AddServiceModal;