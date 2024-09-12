const slashCmds = {
    body: [
        {
            name: "artbot-refresh",
            description: "Force event to run",
			default_member_permissions: "40",
        },
        {
            name: "artbot-deletecontest",
            description: "Delete contests for this channel",
			default_member_permissions: "40",
        },
        {
            name: "artbot-addcontest",
            description: "Adds an event to the list of events",
			default_member_permissions: "40",
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
                {
                    name: "mention",
                    description: "Tag any groups you want to mention in the event",
                    type: 3,
                },
            ],
        },
    ],
}

export { slashCmds }
