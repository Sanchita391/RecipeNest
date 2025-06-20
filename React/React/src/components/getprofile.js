import axios from "axios";
import React, { useEffect, useState } from "react";

const GetProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/profile/getprofiles"
      );
      console.log(response.data.users);
      setProfile(response.data.users);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setProfile(null);
    }
  };

  console.log(profile); 

  return <div>
    
    <h1>User profiles</h1>

    {profile && profile.map((data) => (
      <div key={data._id}>
        <h3>{data.name}</h3>
        <p>{data.email}</p>
        <p>{data.bio}</p>
        <p>{data.skills}</p>
      </div>
    ))}

  </div>;
};

export default GetProfile;