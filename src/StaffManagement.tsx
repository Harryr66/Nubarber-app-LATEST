import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import AddStaffModal from './AddStaffModal';

interface Staff {
  id: string;
  name: string;
  email: string;
  title: string;
  photo?: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      const staffCollection = collection(db, 'staff');
      const staffSnapshot: QuerySnapshot<DocumentData> = await getDocs(staffCollection);
      const staffList: Staff[] = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
      setStaff(staffList);
    };
    fetchStaff();
  }, []);

  const handleAddOrUpdate = async (staffData: Omit<Staff, 'id'>) => {
    if (editStaff) {
      const staffRef = doc(db, 'staff', editStaff.id);
      await updateDoc(staffRef, staffData);
    } else {
      await addDoc(collection(db, 'staff'), staffData);
    }
    setIsModalOpen(false);
    setEditStaff(null);
    // Re-fetch
    const staffSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'staff'));
    setStaff(staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
  };

  const handleEdit = (member: Staff) => {
    setEditStaff(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'staff', id));
    // Re-fetch
    const staffSnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'staff'));
    setStaff(staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
  };

  return (
    <div>
      <button onClick={() => { setEditStaff(null); setIsModalOpen(true); }} className="bg-white text-black">Add Staff</button>
      <div className="grid gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-gray-800 p-4 rounded">
            <h3>{member.name}</h3>
            <p>Email: {member.email}</p>
            <p>Title: {member.title}</p>
            {member.photo && <img src={member.photo} alt="Photo" className="w-20 h-20" />}
            <button onClick={() => handleEdit(member)}>Edit</button>
            <button onClick={() => handleDelete(member.id)}>Delete</button>
          </div>
        ))}
      </div>
      {isModalOpen && <AddStaffModal onClose={() => { setIsModalOpen(false); setEditStaff(null); }} onAdd={handleAddOrUpdate} initialData={editStaff || { name: '', email: '', title: '', photo: '' }} />}
    </div>
  );
};

export default StaffManagement;