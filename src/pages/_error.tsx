function Error({ statusCode }) {
    let errorMessage;
    if (statusCode) {
        errorMessage = `An error ${statusCode} occurred on server`;
    } else {
        errorMessage = 'An error occurred on client';
    }

    return <p>{errorMessage}</p>;
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
