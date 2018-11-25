// http://content.tfl.gov.uk/trackernet-data-services-guide-beta.pdf 
// (Page 9)


(function($) {

const ATTRS = ["Location", "Destination", "TripNo", "TimeTo", "DepartTime", "DepartInterval"];

const API_URL = "https://api.tfl.gov.uk/TrackerNet/PredictionDetailed";
const CORS_URL = "https://axoloy-cors.herokuapp.com";


const searchParams = new URLSearchParams(window.location.search);
const line = searchParams.get("line");
const station = searchParams.get("station");


// No line & station specified - probably stripped searchparams
if (!(line && station)) {
    $("#header #sub")
        .addClass("error")
        .text("Error: No Line/Station specified!");
    return;
}


$.ajax({
    type: "GET",
    dataType: "xml",
    headers: {
        "X-Requested-With": "XMLHTTPRequest"
    },
    url: `${CORS_URL}/${API_URL}/${line}/${station}`,

    beforeSend: () => $("#header #sub").text("Sending request..."),
    
    error: (xhr, status, err) => {
        $("#header #sub")
            .addClass("error")
            .text(`Error!
                   ResponseText: ${xhr.responseText},
                   Status: "${status}",
                   Error: "${err}"`);
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
        // <P N="Eastbound - Platform 2" Num="2" TrackCode="TJ20641" NextTrain="false">
        $xml.find("P").each((index, el) => {
            platformName = $(el).attr("N");

            $platformEl = $("<ul>", {
                "class": "platform",
                "html": `<h3>${platformName}</h3>`
            });

            // Trains
            // <T LCID="1098872" SetNo="302" TripNo="14" SecondsTo="186" TimeTo="3:30"
            //    Location="At Westminster Platform 3" Destination="Stratford" DestCode="423"
            //    Order="0" DepartTime="17:18:12" DepartInterval="186" Departed="0"
            //    Direction="0" IsStalled="0" TrackCode="TJ20700" LN="J"/>
            $(el).find("T").each((index, iel) => {
                setNo = $(iel).attr("SetNo");
                dest = $(iel).attr("Destination");

                $trainEl = $("<li>", {
                    class: "train",
                    html: `<h4>${setNo} ${dest}</h4>`
                });

                $trainDescrEl = $("<ul>", { class: "train-description" });
                // Get all the attribute data we want into the train description
                for (const attr of ATTRS) {
                    attrValue = $(iel).attr(attr);
                    $trainDescrEl.append(`<li><b>${attr}:</b> ${attrValue}</li>`);
                }

                $platformEl.append($trainEl.append($trainDescrEl));
            });

            $platformEl.appendTo("#nexttrain");
        });
    }

});


})(jQuery);
