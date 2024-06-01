import SvgCheck from "./svgCheck";
import SvgLoading from "./svgLoading";
import SvgWrite from "./svgWrite";

function SvgStatusFinalized() {
    return (
        <div className="relative flex justify-center items-center w-24 h-24">
            <div className="absolute z-10 w-9">
                <SvgWrite />
            </div>
            <div className="absolute z-20 bottom-0 right-0 pb-3 pr-4 transform scale-150 text-green-500">
                <SvgCheck/>
            </div>
        </div>
    );
}

export default SvgStatusFinalized;
