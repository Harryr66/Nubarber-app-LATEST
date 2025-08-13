import { useForm } from 'react-hook-form';

interface StaffFormData {
  name: string;
  email: string;
  title: string;
  photo?: string;
}

interface AddStaffModalProps {
  onClose: () => void;
  onAdd: (data: StaffFormData) => void;
  initialData?: Partial<StaffFormData>;
}

const AddStaffModal = ({ onClose, onAdd, initialData = {} }: AddStaffModalProps) => {
  const { register, handleSubmit } = useForm<StaffFormData>({ defaultValues: initialData });

  const onSubmit = (data: StaffFormData) => {
    onAdd(data);
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('name')} placeholder="Name" required />
        <input {...register('email')} placeholder="Email" required />
        <input {...register('title')} placeholder="Title" required />
        <input {...register('photo')} placeholder="Photo URL" />
        <button type="submit">Add Staff</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default AddStaffModal;