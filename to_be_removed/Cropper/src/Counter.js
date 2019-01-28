import $ from "jquery";

export default function (widgetProps, mountingNode) {


    //  Counter Component wrapper
    const counterWrapper = $("<div></div>").addClass("jquery-counter");


    // Header
    const counterHeader = $("<div></div>").addClass("counter-header")
        .append($("<span></span>").text("•••"))
        .append($("<h1></h1>").text(widgetProps.dummyKey))
        .append($("<span></span>").text("•••"));


    // Counter Count
    const counterCount = $("<h1></h1>").addClass("counter-count").text("0");

    // Controls wrapper
    const controlsWrapper = $("<div></div>").addClass("controls-wrapper")
        .append($("<button></button>").addClass("counter-btn").text("-").click(e => {
            const counter = $(counterWrapper).find("h1.counter-count");
            counter.text(parseInt(counter.text(), 10) - 1);
        }))
        .append($("<button></button>").addClass("counter-btn").text("+").click(e => {
            const counter = $(counterWrapper).find("h1.counter-count");
            counter.text(parseInt(counter.text(), 10) + 1);
        }));


    $(counterWrapper)
        .append(counterHeader)
        .append(counterCount)
        .append(controlsWrapper);



    // mount counter to the dom
    $(mountingNode).append(counterWrapper);



};