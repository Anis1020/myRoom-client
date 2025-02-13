import PropTypes from "prop-types";
import { useState } from "react";
import UpdateUserModal from "../../Modal/UpdateUserModal";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
// import useAuth from "../../../hooks/useAuth";

const UserDataRow = ({ user, refetch }) => {
  const axiosSecure = useAxiosSecure();
  const [isOpen, setIsOpen] = useState(false);
  // const { user: loggedInUser } = useAuth();

  const { mutateAsync } = useMutation({
    mutationFn: async (requestedUser) => {
      const { data } = await axiosSecure.patch(
        `/user-role/${user?.email}`,
        requestedUser
      );
      return data;
    },
    onSuccess: (data) => {
      console.log(data);
      refetch();
      toast.success("User role update successfully");
      setIsOpen(false);
    },
  });

  const modalHandler = async (selected) => {
    //not working but vai dekhiyecilo
    // if (loggedInUser.email === user.email) {
    //   toast.error("admin cant be change");
    //   return setIsOpen(false);
    // }

    console.log("modal is open", selected);
    const user = {
      role: selected,
      status: "verified",
    };
    try {
      await mutateAsync(user);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user?.email}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900 whitespace-no-wrap">{user?.role}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        {user?.status ? (
          <p
            className={`${
              user.status === "Verified" ? "text-green-500" : "text-yellow-500"
            } whitespace-no-wrap`}
          >
            {user.status}
          </p>
        ) : (
          <p className="text-red-500 whitespace-no-wrap">Unavailable</p>
        )}
      </td>

      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <button
          // only for admin btn disabled
          // disabled={loggedInUser.email === user.email}
          onClick={() => setIsOpen(true)}
          className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
          ></span>

          <span className="relative">Update Role</span>
        </button>
        {/* Update User Modal */}
        <UpdateUserModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          modalHandler={modalHandler}
          user={user}
        />
      </td>
    </tr>
  );
};

UserDataRow.propTypes = {
  user: PropTypes.object,
  refetch: PropTypes.func,
};

export default UserDataRow;
