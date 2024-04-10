import { Image } from "@nextui-org/react";

const CardIconsList = (props) => {
    return (
            <Image className="rounded-none w-14" src={`/assets/svg/${props.type}.svg`} alt={`${props.type}`} />
    );
}

export default CardIconsList;