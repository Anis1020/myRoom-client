import { useState } from "react";
import AddRoomForm from "../../../components/Forms/AddRoomForm";
import useAuth from "../../../hooks/useAuth";
import { imageUpload } from "../../../api/utils";

const AddRoom = () => {
  const { user } = useAuth();
  const [dates, setDates] = useState({
    startDate: new Date(),
    endDate: null,
    key: "selection",
  });

  const handleDate = (item) => {
    console.log(item);
    setDates(item.selection);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const form = e.target;
    const location = form.location.value;
    const title = form.title.value;
    const category = form.category.value;
    const to = "";
    const from = "";
    const price = form.price.value;
    const guests = form.guests.value;
    const bathrooms = form.bathrooms.value;
    const description = form.description.value;
    const bedrooms = form.bedrooms.value;
    const image = form.image.files[0];

    const host = {
      name: user.displayName,
      image: user.photoURL,
      email: user.email,
    };

    try {
      const image_url = await imageUpload(image);
      console.log(image_url);
      const roomData = {
        location,
        title,
        category,
        to,
        from,
        price,
        guests,
        bathrooms,
        host,
        bedrooms,
        description,
        image: image_url,
      };
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <AddRoomForm
        dates={dates}
        handleDate={handleDate}
        handleAddRoom={handleAddRoom}
      ></AddRoomForm>
    </div>
  );
};

export default AddRoom;
