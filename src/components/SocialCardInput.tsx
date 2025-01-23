import { Input } from '@nextui-org/react';
import React, { useState } from 'react';

interface SocialCardProps {
  name: string;
  baseUrl: string;
  userData: Record<string, string | undefined>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openCard: string | null;
  setOpenCard: React.Dispatch<React.SetStateAction<string | null>>;
}

export const SocialCardInput: React.FC<SocialCardProps> = ({
  name,
  baseUrl,
  userData,
  handleInputChange,
  openCard,
  setOpenCard,
}) => {
  const handleClickMedia = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el clic se propague al contenedor
    setOpenCard(openCard === name ? null : name);
  };

  const isOpen = openCard === name;

  return !isOpen ? (
    <div
      className="hover:opacity-70 hover:cursor-pointer mr-10 h-fit mb-10 sm:mb-4 w-fit "
      onClick={handleClickMedia}
    >
      <img src={`/assets/svg/${name}.svg`} width={35} className="mr-1 absolute" />
      {!userData?.[name] ? (
        <img
          src="https://cdn3.iconfinder.com/data/icons/mixed-ui-icons-3/100/Untitled-64-512.png"
          width={15}
          className="mr-1 bg-white rounded-full left-[120%]  top-[100%] relative"
        />
      ) : (
        <img
          src="https://banner2.cleanpng.com/20180315/djw/av0u3beuj.webp"
          width={15}
          className="mr-1 bg-white rounded-full left-[120%]   top-[100%] relative"
        />
      )}
    </div>
  ) : (
    <Input
      type="text"
      name={name}
      isRequired={false}
      value={userData?.[name]}
      onChange={handleInputChange}
      startContent={
        <>
          <img src={`/assets/svg/${name}.svg`} width={30} className="mr-1" />
          <span className="text-default-400 text-sm    ">{baseUrl}</span>
        </>
      }
      className="w-full sm:max-w-[270px] h-fit  text-default-400 text-sm   "
      variant="underlined"
    />
  );
};
