import SvgLoading from "./svgLoading"
import SvgLogo from "./svgLogo"

function LoadingScreen() {
	return (
		<div className="flex justify-center items-center h-screen bg-genius-orange relative">
			<div className="absolute inset-0 flex justify-center items-center">
				<div className="loading-background" />
			</div>
			<div className="absolute z-20 w-14">
				<SvgLogo fillColor="#FFFFFF" />
			</div>
			<div className="z-10">
				<SvgLoading />
			</div>
		</div>
	)
}

export default LoadingScreen
