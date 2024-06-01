import SvgLoading from "./svgLoading"
import SvgWrite from "./svgWrite"

function SvgStatusWriting() {
	return (
        <div className="relative flex justify-center items-center w-24 h-24">
		
			<div className="absolute z-10 w-9">
				<SvgWrite/>
			</div>
			<div className="z-20 w-24 h-24">
				<SvgLoading fillColor="#DDEBFF"/>
			</div>
		</div>
	)
}

export default SvgStatusWriting
