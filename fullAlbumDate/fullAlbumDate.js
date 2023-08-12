(async function fullAlbumDate() {
    if (!Spicetify.Platform?.History || !Spicetify.CosmosAsync || !Spicetify.Locale) {
        setTimeout(fullAlbumDate, 300);
        return;
    }

    const { CosmosAsync, Locale } = Spicetify;
    const { History } = Spicetify.Platform;

    async function getAlbumDate(uri) {
        const albumInfo = await CosmosAsync.get(`https://api.spotify.com/v1/albums/${uri}`);
        const albumDate = new Date(albumInfo.release_date);
        return Locale.formatDate(albumDate);
    }

    function delay(delayInms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    }

    function setDate(newDate) {
        const dateElement =
            document.querySelector(".main-entityHeader-divider.main-type-mesto") ??
            document.querySelector(".main-entityHeader-metaData span:nth-last-child(2)");
        dateElement.textContent = newDate;
    }

    if (History.location.pathname.startsWith("/album/")) {
        const uri = History.location.pathname.split("/")[2];
        const newDate = await getAlbumDate(uri);
        await delay(1000);
        setDate(newDate);
    }

    History.listen(async ({ pathname }) => {
        if (pathname.startsWith("/album/")) {
            const uri = pathname.split("/")[2];
            const newDate = await getAlbumDate(uri);
            await delay(1000);
            setDate(newDate);
        }
    });
})();
