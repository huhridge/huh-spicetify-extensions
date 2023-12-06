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
        return Locale.formatRelativeTime( albumDate );
    }

    function replaceDate(newDate) {
        const dateElement =
            document.querySelector(".main-entityHeader-divider.main-type-mesto") ??
            document.querySelector(".main-entityHeader-metaData span:nth-last-child(2)");
        if (!dateElement) {
            setTimeout(replaceDate, 100, newDate);
            return;
        }
        dateElement.textContent = newDate;
    }

    async function setDate() {
        const { pathname } = History.location;
        if (pathname.startsWith("/album/")) {
            const uri = pathname.split("/")[2];
            const newDate = await getAlbumDate(uri);
            replaceDate(newDate);
        }
    }

    setDate();
    History.listen(setDate);
})();
