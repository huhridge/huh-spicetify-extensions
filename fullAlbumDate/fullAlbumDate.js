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

    function setDate(newDate) {
        const dateElement =
            document.querySelector(".main-entityHeader-divider.main-type-mesto") ??
            document.querySelector(".main-entityHeader-metaData span:nth-last-child(2)");
        if (!dateElement) {
            setTimeout(setDate, 100, newDate);
            return;
        }
        dateElement.textContent = newDate;
    }

    if (History.location.pathname.startsWith("/album/")) {
        const uri = History.location.pathname.split("/")[2];
        const newDate = await getAlbumDate(uri);
        setDate(newDate);
    }

    History.listen(async ({ pathname }) => {
        if (pathname.startsWith("/album/")) {
            const uri = pathname.split("/")[2];
            const newDate = await getAlbumDate(uri);
            setDate(newDate);
        }
    });
})();
