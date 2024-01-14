import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_ALL_CONTACTS } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatLIstItem from "@/components/Chatlist/ChatLIstItem";

function ContactsList() {
  const [allContacts, setAllContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);

  const [{ userInfo }, dispatch] = useStateProvider();

  const handleBackClick = () => {
    dispatch({
      type: reducerCases.SET_ALL_CONTACTS_PAGE,
      payload: false,
    });
  };

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users },
        } = await axios.get(GET_ALL_CONTACTS);
        setAllContacts(users);
        setFilteredContacts(users);
      } catch (error) {
        console.log(error);
      }
    };

    getContacts().then((r) => console.log(r));
  }, []);

  useEffect(() => {
    if (searchTerm.length) {
      const filteredData = {};
      Object.keys(allContacts).forEach((initialLetter) => {
        const cur = allContacts[initialLetter].filter((user) => {
          return user.name
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());
        });
        if (cur.length) {
          filteredData[initialLetter] = cur;
        }
      });
      setFilteredContacts(filteredData);
    } else {
      setFilteredContacts(allContacts);
    }
  }, [searchTerm]);
  return (
    <div className="h-full flex flex-col ">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack
            className="text-xl cursor-pointer"
            onClick={handleBackClick}
          />
          <span>New Chat</span>
        </div>
      </div>

      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg flex-grow mx-4 ">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-lg" />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search Contacts "
                className="bg-transparent text-sm focus:outline-none text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {Object.entries(filteredContacts).map(([initialLetter, userList]) => {
          return (
            <div key={initialLetter}>
              <div className="text-teal-light pl-10 py-5 ">
                {" "}
                {initialLetter}
              </div>
              {userList
                .filter((user) => user.id !== userInfo.id)
                .map((user) => {
                  return (
                    <ChatLIstItem key={user.id} user={user} isContactPage />
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContactsList;
