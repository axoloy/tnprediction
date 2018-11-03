(function($) {

const attrs = ["Location", "Destination", "TripNo", "TimeTo", "DepartTime", "DepartInterval"];

const corsUrl = "https://cors-anywhere.herokuapp.com";

const searchParams = new URLSearchParams(window.location.search);
const line = searchParams.get("line");
const station = searchParams.get("station");


// No line & station specified - probably stripped searchparams
if (!(line && station)) {
    $("#header #sub")
        .addClass("error")
        .text("Error: No Line/Station specified!");
    return;
};


$.ajax({
    type: "GET",
    dataType: "xml",
    headers: {
        "X-Requested-With": "XMLHTTPRequest"
    },
    url: `${corsUrl}/http://api.tfl.gov.uk/TrackerNet/PredictionDetailed/${line}/${station}`,
    error: (xhr, status, err) => {
        $("#header #sub")
            .addClass("error")
            .text(`Error\nStatus: "${status}",\nError: "${err}"`);
    },
    success: (xml) => {
        const $xml = $(xml);

        // Headers and whatnot
        const lineName = $xml.find("LineName").text();
        const stationName = $xml.find("S").attr("N");
        const created = $xml.find("WhenCreated").text();

        $("#header #title").text(`${lineName} - ${stationName}`);
        $("#header #sub")
            .addClass("success")
            .text(`Last Updated: ${created}`);

        let platformName, setNo, dest, attrValue;
        let $platformEl, $trainEl, $trainDescrEl;

        // Platforms
        $xml.find("P").each((index, el) => {
            platformName = $(el).attr("N");

            $platformEl = $("<ul>", {
                "class": "platform",
                "data-name": platformName,
                "data-num": $(el).attr("Num"),
                "html": `<h3>${platformName}</h3>`
            })

            // Trains
            $(el).find("T").each((index, iel) => {
                setNo = $(iel).attr("SetNo");
                dest = $(iel).attr("Destination")

                $trainEl = $("<li>", {
                    class: "train",
                    html: `<h4>${setNo} ${dest}</h4>`
                })

                $trainDescrEl = $("<ul>", {
                    class: "train-description",
                })
                // Get all the attribute data we want into the train description
                for (const attr of attrs) {
                    attrValue = $(iel).attr(attr);
                    $trainDescrEl.append(`<li><b>${attr}:</b> ${attrValue}`);
                }

                $platformEl.append($trainEl.append($trainDescrEl))
            })

            $platformEl.appendTo("#nexttrain");
        })
    }

})


})(jQuery);
