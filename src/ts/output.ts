//--[ Interfaces ]-------------------------------------------------------------

interface IOutputStatic {
    toColor(str: string): void
    console(str: string): void
}

//--[ Static Methods Class ]---------------------------------------------------

class output {
    static toColor(str: string): void {
        const regex = /@x[0-9A-Fa-f]{2}/gi
        const colors = {
            F0: "\x1b[30m",
            F4: "\x1b[31m",
            F2: "\x1b[32m",
            F6: "\x1b[33m",
            F1: "\x1b[34m",
            F5: "\x1b[35m",
            F3: "\x1b[36m",
            F7: "\x1b[37m",
            F8: "\x1b[30;1m",
            F9: "\x1b[34;1m",
            FA: "\x1b[32;1m",
            FB: "\x1b[36;1m",
            FC: "\x1b[31;1m",
            FD: "\x1b[35;1m",
            FE: "\x1b[33;1m",
            FF: "\x1b[37;1m",
            B0: "\x1b[40m",
            B4: "\x1b[41m",
            B2: "\x1b[42m",
            B6: "\x1b[43m",
            B1: "\x1b[44m",
            B5: "\x1b[45m",
            B3: "\x1b[46m",
            B7: "\x1b[47m",
            B8: "\x1b[40;1m",
            B9: "\x1b[44;1m",
            BA: "\x1b[42;1m",
            BB: "\x1b[46;1m",
            BC: "\x1b[41;1m",
            BD: "\x1b[45;1m",
            BE: "\x1b[43;1m",
            BF: "\x1b[47;1m",
        }

        let matches = str.match(regex) || []

        matches.forEach((match) => {
            // @ts-ignore
            str = str.replace(match, "\x1b[0;0m" + colors["B" + match.toUpperCase()[2]] + colors["F" + match.toUpperCase()[3]])
        })

        console.log(str + "\x1b[0;0m")
    }

    static console(str: string): void {
        //const dateOptions: Intl.DateTimeFormatOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };
        const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: true }

        let now = new Date(Date.now())
        //const date = now.toLocaleDateString(undefined, dateOptions).replace(/\//g, '-');
        const time = now.toLocaleTimeString(undefined, timeOptions)

        function prependColorCodes(input: string): string {
            let output = ""
            let colorize = true

            for (let i = 0; i < input.length; i++) {
                const char = input[i]

                if (char === "[") {
                    output += "@X08[@X0C"
                    colorize = false
                } else if (char === "]" && colorize == false) {
                    output += "@X08]:"
                    colorize = true
                } else if (char === "(") {
                    output += "@X08(@X0E"
                    colorize = false
                } else if (char === ")" && colorize == false) {
                    output += "@X08)"
                    colorize = true
                } else if (/\d/.test(char) && colorize == true) {
                    output += "@X0C" + char
                } else if (/[A-Za-z]/.test(char) && colorize == true) {
                    output += "@X0F" + char
                } else if (/[,.:;'"/\/]/.test(char) && colorize == true) {
                    output += "@X0B" + char
                } else {
                    output += char
                }
            }

            return output
        }

        output.toColor(prependColorCodes(`(${time}) ${str}`))
    }
}

//--[ Exports ]----------------------------------------------------------------

const typedOutput: IOutputStatic = output
export { typedOutput as output }
