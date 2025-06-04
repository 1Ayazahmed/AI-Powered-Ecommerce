import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
// ⚠️⚠️⚠️ don't forget this ⚠️⚠️⚠️⚠️
// import AdminMenu from "./AdminMenu";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");

  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure")) {
      try {
        await deleteUser(id);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const toggleEdit = (id, username, email) => {
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    try {
      await updateUser({
        userId: id,
        username: editableUserName,
        email: editableUserEmail,
      });
      setEditableUserId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Users</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-xs sm:text-sm md:px-4 md:text-base min-w-[8rem]">ID</th>
                <th className="px-2 py-2 text-left text-xs sm:text-sm md:px-4 md:text-base min-w-[8rem]">NAME</th>
                <th className="px-2 py-2 text-left text-xs sm:text-sm md:px-4 md:text-base min-w-[8rem]">EMAIL</th>
                <th className="px-2 py-2 text-left text-xs sm:text-sm md:px-4 md:text-base min-w-[4rem]">ADMIN</th>
                <th className="px-2 py-2 text-xs sm:text-sm md:px-4 md:text-base min-w-[4rem]"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-700">
                  <td className="px-2 py-2 text-xs sm:text-sm md:px-4 md:text-base break-words min-w-[8rem]">{user._id}</td>
                  <td className="px-2 py-2 text-xs sm:text-sm md:px-4 md:text-base break-words min-w-[8rem]">
                    {editableUserId === user._id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editableUserName}
                          onChange={(e) => setEditableUserName(e.target.value)}
                          className="w-full p-1 border rounded-lg bg-[#101011] text-white text-xs sm:text-sm"
                        />
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="ml-1 bg-blue-500 text-white py-1 px-2 rounded-lg text-xs sm:text-sm"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {user.username}{" "}
                        <button
                          onClick={() => toggleEdit(user._id, user.username, user.email)}
                          className="ml-1 text-blue-400 text-xs sm:text-sm"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-xs sm:text-sm md:px-4 md:text-base break-words min-w-[8rem]">
                    {editableUserId === user._id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editableUserEmail}
                          onChange={(e) => setEditableUserEmail(e.target.value)}
                          className="w-full p-1 border rounded-lg bg-[#101011] text-white text-xs sm:text-sm"
                        />
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="ml-1 bg-blue-500 text-white py-1 px-2 rounded-lg text-xs sm:text-sm"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <a href={`mailto:${user.email}`} className="text-blue-400 hover:underline break-all text-xs sm:text-sm">{user.email}</a>{" "}
                        <button
                          onClick={() => toggleEdit(user._id, user.name, user.email)}
                          className="ml-1 text-blue-400 text-xs sm:text-sm"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-xs sm:text-sm md:px-4 md:text-base min-w-[4rem]">
                    {user.isAdmin ? (
                      <FaCheck style={{ color: "green" }} />
                    ) : (
                      <FaTimes style={{ color: "red" }} />
                    )}
                  </td>
                  <td className="px-2 py-2 text-xs sm:text-sm md:px-4 md:text-base min-w-[4rem]">
                    {!user.isAdmin && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs sm:text-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
