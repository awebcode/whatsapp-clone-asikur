import React, { useEffect, useRef } from "react";

function ContextMenu({ options, coordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.id === "context-opener") return;
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false);
    callback();
  };
  return (
    <div
      className={`bg-dropdown-background fixed py-2 z-50 shadow-xl rounded-md`}
      style={{
        top: coordinates.y,
        left: coordinates.x,
      }}
      ref={contextMenuRef}
    >
      <ul>
        {options.map(({ name, callback }, index) => (
          <li
            key={index}
            onClick={(e) => handleClick(e, callback)}
            className="px-5 py-1 cursor-pointer hover:bg-background-default-hover"
          >
            <span className="text-white text-sm ">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContextMenu;
