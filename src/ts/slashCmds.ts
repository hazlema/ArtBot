const slashCmds = {
    body: [
        {
            name: "addcontest",
            description: "Adds an event to the list of events",
            options: [
                {
                    name: "name",
                    description: "Name of the event",
                    required: true,
                    type: 3,
                },
                {
                    name: "frequency",
                    description: "Frequency of the event in hours",
                    required: true,
                    type: 4,
                },
            ],
        },
    ],
}

export { slashCmds }
