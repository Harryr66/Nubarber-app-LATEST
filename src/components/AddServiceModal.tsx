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
    <div className="modal">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('name')} placeholder="Service Name" required />
        <input {...register('duration', { valueAsNumber: true })} placeholder="Duration (min)" type="number" required />
        <input {...register('price', { valueAsNumber: true })} placeholder="Price" type="number" required />
        <button type="submit">Add Service</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default AddServiceModal;