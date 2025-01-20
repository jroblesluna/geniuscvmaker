function SvgLoading({fillColor}) {
    return (
        <svg width="100%" height="100%" version="1.1" id="L3" viewBox="0 0 100 100" xmlSpace="preserve">


            <circle fill="transparent" stroke={fillColor} strokeWidth="1" cx="50" cy="50" r="30"
                strokeDasharray="100" /* Circumference of full circle */
                strokeDashoffset="25" /* Circumference of half circle */
                transform="rotate(75 50 50)" /* Rotate the circle around its center */
            />
            <defs>
                <path id="circlePath" d="M 50,25 A 25,25 0 0,1 75,50" />
            </defs>
            <text>
                <textPath xlinkHref="#circlePath" fill={fillColor} startOffset="0%" fontSize={8}>
                    CV MAKER
                </textPath>
            </text>

            <circle fill="transparent" stroke={fillColor} strokeWidth="1" cx="20" cy="50" r="2">
                <animateTransform
                    attributeName="transform"
                    dur="1s"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>

    )
}

export default SvgLoading