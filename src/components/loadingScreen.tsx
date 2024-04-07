import SvgLoading from "./svgLoading"
import SvgLogo from "./svgLogo"

function LoadingScreen() {
	return (
		<div className="flex justify-center items-center h-screen h-max-xl bg-genius-orange relative">
		
			<div className="absolute z-20 w-14">
				<SvgLogo fillColor="#FFFFFF" />
			</div>
			<div className="z-10">
				<SvgLoading fillColor="#FFFFFF"/>
			</div>
		</div>
	)
}

export default LoadingScreen
