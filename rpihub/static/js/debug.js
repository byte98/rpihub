// rpihub - simple RaspberryPi hub for other programs
// Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
// 
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; version 2 of the License.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

/**
 * Class used for debugging purposes.
 * This class supplies emulation of API calls.
 */
class Debug{

    /**
     * Generates random color in hex format.
     * @returns {string} Random color in hex format.
     */
    static #generateColor(){
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    }

    /**
     * Generates random application name.
     * @returns {Map<string, string>} Random application name in different languages.
     */
    static #generateAppName(){

        const langs = ["en", "cs"];
        const defaultLang = langs[0];

        const addjectives = {
            "en": ["My", "Your", "First","Amazing", "Brilliant", "Cool", "Dynamic", "Epic", "Fantastic", "Great", "Heroic", "Incredible", "Joyful", "Majestic", "Noble", "Outstanding", "Powerful", "Remarkable", "Spectacular", "Terrific", "Unbelievable", "Vibrant", "Wonderful"],
            "cs": ["Můj", "Tvůj", "První", "Úžasný", "Brilantní", "Skvělý", "Dynamický", "Epický", "Fantastický", "Velký", "Hrdinský", "Neuvěřitelný", "Radostný", "Majestátní", "Ušlechtilý", "Výjimečný", "Silný", "Pozoruhodný", "Spektakulární", "Skvělý", "Neuvěřitelný", "Živý", "Nádherný"]
        }

        const nouns = {
            "en": ["App", "Program", "Software", "Tool", "Utility", "Application", "System", "Platform", "Framework", "Service"],
            "cs": ["Aplikace", "Program", "Software", "Nástroj", "Pomůcka", "Služba", "Systém", "Platforma", "Rámec", "Služba"]
        }

        const reti = new Map();
        for (const lang of langs){
            reti.set(lang, "");
        }

        const adjectivesToUse = Math.floor(Math.random() * 3 + 1); // Random number of adjectives to use (between 1 and 3)
        for (let i = 0; i < adjectivesToUse; i++) {
            const adjectiveIdx = Math.floor(Math.random() * addjectives[defaultLang].length);
            for (const lang of langs){
                reti.set(lang, reti.get(lang) + addjectives[lang][adjectiveIdx] + " ");
            }
        }

        const nounIdx = Math.floor(Math.random() * nouns[defaultLang].length);
        for (const lang of langs){
            reti.set(lang, reti.get(lang) + nouns[lang][nounIdx]);
        }
        reti.set("_default", reti.get(defaultLang));
        return reti;
    }

    /**
     * Generates a random application description.
     * @param {Map<string, string>} names - The names of the application.
     * @returns {Map<string, string>} A map containing the application description in different languages.
     */
    static #generateAppDescription(names){
        const langs = ["en", "cs"];
        const defaultLang = langs[0];
        const reti = new Map();
        const descripionPrefixes = {
            "en": ["This is a", "Welcome to the", "Introducing the", "Discover the", "Experience the", "Get ready for the", "Unleash the power of the", "Explore the world of the", "Step into the realm of the", "Embark on a journey with the"],
            "cs": ["Toto je", "Vítejte v", "Představujeme vám", "Objevte", "Zažijte", "Připravte se na", "Uvolněte sílu", "Prozkoumejte svět", "Vstupte do říše", "Vydejte se na cestu s"]
        };
        const descripionSuffixes = {
            "en": ["application.", "program.", "software.", "tool.", "utility.", "system.", "platform.", "framework.", "service."],
            "cs": ["aplikace.", "programu.", "softwaru.", "nástroje.", "pomůcky.", "systému.", "platformy.", "rámce.", "služby."]
        };
        for (const lang of langs){
            const prefixIdx = Math.floor(Math.random() * descripionPrefixes[defaultLang].length);
            const suffixIdx = Math.floor(Math.random() * descripionSuffixes[defaultLang].length);
            reti.set(lang, descripionPrefixes[lang][prefixIdx] + " " + names.get(lang) + " " + descripionSuffixes[lang][suffixIdx]);
        }
        reti.set("_default", reti.get(defaultLang));
        return reti;
    }

    /**
     * Generates a random application icon in base64 format.
     * @returns {string} A base64-encoded string representing the application icon.
     */
    static #generateAppIcon(){
        const icons = [
            "data:image/png;base64,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",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD20lEQVR4nO2dz0sUYRjHXzxkdRLBbnWvS3gM1MbWjkIn00NeCgyqdTVE81DXksB/wNBLGqgQZGAhvKViXbuUo0fZ8tLuvq9gv4wnHpmVYXYWxBl3nm2/X/hcZ3ifzz4z787heZVCEARBEARBEARBEARBEARBEERCcrncOWvtiDFmxRjz1RizZ62lWsYYs2eMyRpjlq21w7u7u2ePXQQRnbTWPjXG/Ey6AFY4xpgf1toxIqo/Fhk7OztnrLUfk16orTLy+TzXrOk4OuND0ouzVUo2m/20trZ2KjYh/JhKelG2yllZWXmhlKqP5QUe9s7I5ws0NfGabvY+po62AXIupWuajraB/VpwTbg2wXrlcrnfnZ2dPUqpuqjdMRom497t8cSL4Ajlbt94qJT5+flppdTFSEJ4axu88OTEQuKLdoTDnRKsm+u6X5RSXUqp01GEfAtemFuzeOOeR2+pf2mPMppqmv6lPep5+OagLrd6n5QI2d7eziml+LF1IYqQkj99/ncGZJBPyp+DunCNgnUrFAp/PSGpIwsJ2zH4WzPpImSE4a9NWO08IdcgRIsS0g0hWpQQBkIyEFJ7OBBCooAQLQsI0bIQKeT6g1fU3hLfB8f2loH9a5YrwvstIjdXWd5tVZGQK5eHYv82lHKGygqptIwitd0howsQclQhlcaFEAhxIYQgBEIIQjJHgLeglZZRVdveWsaBEBIFhGhZQIiWhUgh+JaVliUE37LSsoTgW1ZalpBK40IIhLgQQhACIQQhmSOAb1nChGQEASFaFhCiZQEhWhYQomUBIVoWEKKJBqeH6P5kZ0UZnBmGkEwZKi2jCIRoCIGQSQghCIEQghAI+X+FDM4MV1zG4MwIhGSqAAjRsoAQLQsI0bKAEC0LCNGygBAtCwjRNSYEI/7oOEb8RRKSDV6YBzwWb8yDHyGFDjsE83scQpaDF+YRqP7WBOlDjYldX1//HMeIv5HghXlIMA8LTnrRjlB4yHTYIOXZ2dnnkYdg8jkY3tELJVL4V8CtiVHj6f0acC2mnpUdNf7LcZw7kcfEel0yFrZjAPbQLC4uvvS9P85HEkJEJ/L5fMnIcWAPxebmptvY2NjryYg2atzXJU18DkbSi7NVxsbGhtvc3Nzn645ow/j94UNJVldXZ/johaQXaoXD7wx+TDU0NNzwybga+biKkNTzORhzc3PTPO2fB8zzH56kC2AThmvAteCtLdemtbW1+AIv0hHLgS5lUue1XlfgpkCV0OXVKvbOCMtpb8eQ8vbW3QIK0JMw3V4tUl5t4jt7CkEQBEEQBEEQBEEQBEEQRJXJP/D4HoC9ax3eAAAAAElFTkSuQmCC",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAACmklEQVR4nO1ZO2sUURSeVGrnT5BAtLVIFSJKxOCD3bnn7AbRIj6QWPhAoxCX+EgEJRZio5WF/gLb+IIVyWPvOd/sYJtOf4C2CsLIXWc2qWRnUsyMmQ++4h7uXM7HzNz7nXM9r0KFCv8nWGSYVOfyJqvOTq2t7UmdPAPfGIgKwvepRBDwjlV/cBDUjLX78ySrzsYiWmkEtAlYMZ2OT6pNAu71qHqTROpG5GI/Zu0lFyPgehLzRU67GKvedWMDtNzYB872nxO5Eq9/ecv60y7WBG4lsZ4IICLVhVILYOBOegE5fz4mJql+Ptdu7x5YQAOYZNWPeSduEqo+Gjj5/lsQeVJqAQzcL8IuRMANBkxqAV4UDRFwm4Cn26FRfUbA9yz7PwG/2drzXt7gbneEgaUMNHnnXmHngoGHA/xoS14RwarzcYLLrPoiTxLw2g/DvakExFbiiw8cMsD4FECOfhDU/NXVsVqnM5HEDDDZEBkzIieSWGN9/Yibx52OcWOyltx4SuRwModVT7rnaqrH+utbe9TNI+BUEqtbO9oIgsUsAlaSRRJj1TNZIvWm6nTfbInMOANmVK/2Y6pnYtPXisfzPTPnTN6mcbvWM3PODG4avAuxCZzdauZSn8Ssutwzc8B43m/A/K0JPh3f2Ng1sAA/DPex6pu8bYSJGdcDc6U1c5y2oIk/o+d1kQN5J1+3djSTAD8MD1IQvCLVxzkzZNWfBEx4RQS51sm/HKnqL7cz5Z1nhR2KKBriIJjJ1BLsdkfyTx54mbUd6MrIhuqi6w1tiyK1TPmXvqgndxIXpDNnMveFCiKAXKdcZLjsZm4hvZ0uqwAqWHOXUwtQfVvqCw5292PA1wJcLUXxmfIh6z3ZUgH4IHXyFSpU8EqDPzZjvBYCf4kZAAAAAElFTkSuQmCC",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAALk0lEQVR4nO3caVATeRoG8OxRu65ftnauqp3ZUQ4VEPHWwQPwQA4BwQN1XHXGCxXkkEMdZ6qsmtoP+2F2atwZa8uZ2p1SDGBAkPtSUTmCFzeEoHiRi4SEhCMQQni3ujtihJDupK+geaqeKr/6e1Pdnf/bhMNxxBFHHHHEEUccccQRRxyxoyQ9gY8SBRCYJIS4RKHhQpLQcCOx3dCUKDB0JrQbVAkCgy5eYNAlCEZVca2jnXGto01xbYby2BbDhdiW0djYZn1AbB18yPb/Y9rknBhmJj+G8JQOOJ8shKbkdhhLEo4B0sR2rCeRCsYgAa0B4tuwxiFtNUAs2lE40YI1plk/FtM82hjdpP/hWIt+y8ka+BPb/0+7yjmA355uh7XJHXAxRQiaZCEAUtLwKP4oRBt7vFkPx5v0cLRxRHO0ceRyVIM+LJIHv+O8qzn3DGakdEB0Sgc8TenA0CmDb5kMf8zYo42ve6R+pDOqYeR4bAf8kfNOXWaEkJzSARIUvoNe+HF8E/iohhG0R5DWj8Chep3kcMNIYtRDmMl5m5PUAWHJHfCMTvhoK+APG3uoXgeH6nRw4JGu60Dd8A7O25bTAnBKFkI+eXgDnGh9Ez6GAviDxh54hPXLh7rcfQ+1szhvQ1LaISJZCCqq4E/QCY/iD8MXaIc0++/pdnKma5AbG/o4aSN8HO6TDUH4Bmvhh2H/A6z7kN4bvjjtbtJn2uD9ZCHwMXggBB9P+JGSIfj7w7D3/hDav98bqoqsUb/HmQ5JEcDHyJcoPPgERuBHrId/YAKP4cMetNq2Xfe1n3LsOYnt4J7UDi/NwZ+kA76RXvhx/FotfI6UP/gismrYjWOPOSmETxKFhudJ7Sb4pvAC+4ffOxV8rRZ287Hu4mtFe6q1szn2ds1PEhjaphv8PuvgYVeNFnbWDMLO6sFWu7knIE8Iie0GPnn4UfrgJ91gbYSvGYRIpNWDsKNqoDqoyA6ejk4KDD9RCt9EHn7qJ5up4IeIwxu7vWoQtlUOnGcVP0EAO+wB/gDV8HzL8NurBmAb0soBiKjs28YKfrwAnOLbDGo24A+awj9iB36rsRF3B3q3sXFTjm8z5Nl6Jm8t/CGz8Dq24SHibj+EY73OLH6rPoIO+COm5zV0wddSAT/wCh623MEaflsTxgg+cmYe1zb6nAr4KDz4OvuFDzfCIw273Q+hFX1PI5lYd55oHU0hs4WadvCVEy43E+DDbvdBKNKKPgip0CTQ/swf26IXE4U/RiP87so+WP7tA/j08/w3uuSb2ingtYTgp7zOW4THuvmmRuJXATNoG8CJ5tFosus/cieUQ+inPSjtJbgeLp2Ej3TxN7VWwW+nAv4W1uBbGgi8pT5K29sL0S36p8wsQ4bNwm8rUcCis3yz8KYDsAS/gyZ4pEE3NRB4Q/OEA/AbygdwvFm/ni34iAI5LPv2IczaU2AR/9UATOEjzcFXUQ+P4mMDgE03+3wpH0B0s/5/zMEPw67bGlj/cwfMP3kHF33iANiCD0Crhk3l6l8oxUfeJjveNKJmagu17j9CQp92c130dS1J+P7J8BWE4dFuLFdrvGteUvdIGt2oD2ds/Xd/CFZ912QT/qsBsAXvj7RMDRvLkH+rQigbwNFG/Xkm13+rSA2Azxo8ht+Ldn2p6jvqBtCgb2Jy/edtYQBO+4stDmDh13zr4G/bDr/JDPyGUqzrS1T1lOAfa4CPoup1Y0xuobynGIBnShWE5MlxB0AXfIBZePWb8Ch+L/iVqAx+eX0fkB7A4QZ9INNbKG+TASA34wWnqiAgQ4TeXLdW9FkewFk+ZfCB5uDLLcOvQ6sCv2KkPf6kB3CobiTOGngqtlC+F4Ww/B+PwO+XxxBR1vvGt9eIWxqLA/A6y38Nf4cYfLARPogyeBX4FqvAp1AVQ34A9boLjKz/+MQOysJv4g8AD34cnyZ43yIV+CAtVP6b9AAOPtKV29MWKpzAACbChxCFv0ERfJEK1hYpYW2BspT0AA48Gm62py3UlhtqiwNYgAyAbfhCJawpVMLqgp5G0gP48qHuOetn8ndfP9WE4Q3gKz7r8Bi+ElYV9DwlPYAvHg4p7WkLFVqOPwDa4Ystw2P4SliVr1CQH8CDIR1b8BFmnuVDyiwPwPOrmjfhb5KB77URvgftZ3k9w6QHsP/+kI4p+K0ETig3l/XiDoAN+NUm8N5I83pgZS4FA9h7f0hpFv6eJXj61n/BBAZACr7EMvw4vgX4z4xdmUvBJWjvvaHnZOGp3EIFleIM4EwNpfA+tsDnKRB8WH5dQf4mvKdW22wtPJ3LkMBSlcUBzD9TQwre11r4fFN49FMPK4xdnqMg/xi6p1ZbjgeP4jO0hQoowR/AlPClk+H96IC/jnXZdTn5L2K7a7UXJsLvohy+n/CZ/CYCAzAHj/8sTyW8ApblyGFptpz8UcRu/mDcbjx49AbLzBbKv9jyADxO11j/JWoq+AIb4V/1Wjf5w7id1QOB9gAfYHyy2VikxB0A2/BLsrEuzpKRP46OvNv34c7qgbHJ8ATeGqZhC7WBwABYh0fbbViRLXqf9ADQIVQNNrEFHzBhC7WhEH8AjMPnmMLLYdG1blh0TVbHoSrbqwZ+YAo+EGf9t76wx+IA3E/XWIYvpA9+MQqP1Suzm7ql/NaqwS10wQdZuQxZV4A/AHrgFZPgl5iBX5iFdUGWfDNlA0Dee4+oHFBbhGdo/eeXjz8ASuEtXefNwHsh+JkytTePwhezkITf6f+vLfBUr/988xUWB+B2qpo0/HIb4b0yUXxYwJP+TCk+OoDK/nWW4JnaQvnm4Q9g4tEwHvwKquAzZeCZKQOPTLEPLa+nb7nd3xlG9NiApmWITy7+APDgrX6kJAjvyZOBB0/6mJbX05GEVfQdZwve13hCuRZnAPNOVY/DTzgaphV+vrHuPFkUh64gf5ofUqER48LTuAxZc12OPwC64LOmhve4KgP3DGnXnKIOen++IOSWJokN+LUEt1ATz+Stg5fbBO9xVQruV6XgliaN49Cd0DzxzOCbmmeUwpcQg19jp/DuGVJwy5A8mf3rM/r+QM80wTc0wUTfk2ds/ZdHEv6arfBY56ZJqft7ACIJKFfnUgXvS+pMnl14t3QpzEuXZHOYjn+5atamMnWvLfCMLENy6IF3fxMe5qZLVK7pInZ+S25juSbUv7R3DG/9t24aws83wntMhM9A4I34aeKxuWnirRw2s6Gs97xdrP9yzJ3JE4f3tAYexZeAK1f8PYftIN8NNpT2VtvNFiqbGPwCEvBzUHzJ3fm8lj9w7CH+5ao/+xX3NtgzvJfpt9ep4K/iwyN1uSJu+RvvpX38aN+rbMjv+cS3WPmc3S1U9zj8QhrgXbkScOGKu1wuie3zh71XFyvcfIpUL9jaQi2kEd6VKwYXruiF8yXRPI49x6dY/tc1BT2NbGyhvCzB88jAi8H5iqiVtcdNa+Ndon5vdX5PNZkt1FIyJ5SUwKOXG+R6D05XRHdncV/8hTOd4lcBv/fO6/mnd55ijM71nxdd8MinPlU05pwqOm83Tzu2ZGWuInxlrkJF9xbKk0p47FOvceaKIjlvQ1YVqGavyJXn0r0M8aAA3oifPW2u99ZkabY8dFmO4in18DJq4FNFnbNSu5g91WQ6yOsaS3PkCUuzu0WMw79+lh+/wWKfeHGXU6o4nrHzfHsIsrpbdE1xdFGW7An5ZQgxeNfJ8I+dLkuipvVNlop48RTLvLJk570yu3uohJ/4LI8+UqaK1c6posvOl0T+tL29MF0z+9dnMxbwpCGePOn3njxp/Xye1EAYfupvrwbnVHGd0xXxv1y4XZvfqcsM2czjij9w58k2uV+VxrhlSH6clyEpc0uXNLilSzrnpkmUc9MkujlIuRKla5q405UraXDhSkpdroh+dL4iinHmivw/vkTRK+KOOOKII4444ogjjjjiiCMcavJ/cBd52VY7YswAAAAASUVORK5CYII=",
            "data:image/png;base64,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",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAACHUlEQVR4nO2dPU4cQRBGR1hwDXcROuUgRjaG45AacLhdiBgLS1yIf0t7BHcxKW11YInEK1lsd5XhPemLR9/3pO3ZZHqaAAAAAAAAAAAA/oEPl3UrZTtIWi4k27WoPYpafWV5bN1ax3Rq+63zFAHR8lnUHgIMVEcmZbvfzuWT3/KX9V3K5Zv3EOKecjId1o3h+zO+Pc+Rx8+Od+kaKe9z2R154N57F5Z4+TnkYG5vOwHK1qD50l2A5PIjQNEaMSmX790FpGy33kUlarJd9xegZu5FNWbaNt0FeJeU4EGAIuBFWc5PoYKAGQEIUARUBCCgImBGAAIUARUBCKgImBEwRIB0ft66n48ARQACehJ9AEEAAroSfQBBwOpCvV8DBQEI6AoCDAGCAAQIAgwBCDAECAIQIAgwBKyr0BIBCFgi4ClMEDAjAAGKgIqAQQJkzRn9fAQoAhDQk+gDCAIQ0JXoAwgCENCV6AMIAhDQlegDCAIQ0JXoAwgCVg/gHUEAAl4EAgwBSwQQQYC9TQF8tM/+mqT2a4SAG++iEjXZrgYIKBfuRTVmkpbz/gJObd+7qETNoux1F7BzVjeT2p17WQ2Xh2G3arSbIwIUrpGSFuXjNJJ2c4R3aYmTr9NwDuuGZDsOUL4658jlCpM/tJsj3uKZkNTuhv/srDqY2+UF7fv57V34Nf5ZS61T69Y6Lspe6+y9OwAAAAAAAAAATP8VvwFQ296sA7P04AAAAABJRU5ErkJggg==",
            "data:image/png;base64,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"
        ];
        return icons[Math.floor(Math.random() * icons.length)];
    }

    /**
     * Generate the app target based on the provided names.
     * @param {Map<string, string>} names Names to generate the app target for.
     */
    static #generateAppTarget(names){
        const name = names.get("_default") || "app";
        const words = name.split(/[\s_-]+/);
        let reti = "/";
        for (const word of words){
            const lettersToUse = Math.min(Math.floor(Math.random() * 3) + 1, word.length);
            reti += word.substring(0, lettersToUse).toLowerCase();
        }
        return reti;
    }

    /**
     * Generates the pseudo-random application.
     * @returns {Application} The generated application.
     */
    static #generateApplication(){
        const names = Debug.#generateAppName();
        const descriptions = Debug.#generateAppDescription(names);
        const target = Debug.#generateAppTarget(names);
        const icon = Debug.#generateAppIcon();
        const accentColor = Debug.#generateColor();
        return new Application(names, descriptions, icon, target, accentColor);
    }

    /**
     * Generates a list of pseudo-random applications.
     * @param {number} min Minimum number of applications to generate.
     * @param {number} max Maximum number of applications to generate.
     * @returns {Application[]} The generated list of applications.
     */
    static #generateApplications(min, max){
        const reti = [];
        const count = Math.floor(Math.random() * (max - min + 1)) + min;
        for (let i = 0; i < count; i++){
            reti.push(Debug.#generateApplication());
        }
        return reti;
    }

    /**
     * Generates a pseudo-random character from the given alphabet.
     * @param {string} alphabet The alphabet to use.
     * @returns {string} The generated character.
     */
    static #generateChar(alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"){
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    /**
     * Generates a pseudo-random string of the specified length.
     * @param {number} min The minimum length of the string.
     * @param {number} max The maximum length of the string.
     * @returns {string} The generated string.
     */
    static #generateString(min, max){
        const length = Math.floor(Math.random() * (max - min + 1)) + min;
        let reti = "";
        for (let i = 0; i < length; i++){
            reti += Debug.#generateChar();
        }
        return reti;
    }

    /**
     * Function, which simulates fetching list of applications from the server.
     * @param {number} appMin Minimum number of applications to fetch.
     * @param {number} appMax Maximum number of applications to fetch.
     * @param {number} waitMin Minimum time to wait before fetching.
     * @param {number} waitMax Maximum time to wait before fetching.
     * @param {function(Application[]): void} callback The function to call with the fetched applications.
     */
    static fetchApplications(appMin, appMax, waitMin, waitMax, callback){
        const waitTime = Math.floor(Math.random() * (waitMax - waitMin + 1)) + waitMin;
        window.setTimeout(() => {
            const applications = Debug.#generateApplications(appMin, appMax);
            callback(applications);
        }, waitTime);
    }

    /**
     * Function, which simulates fetching the base version of the language from the server.
     * @param {number} waitMin Minimum time to wait before fetching.
     * @param {number} waitMax Maximum time to wait before fetching.
     * @param {function(string): void} callback The function to call with the fetched version.
     */
    static fetchLanguageBaseVersion(waitMin, waitMax, callback){
        const waitTime = Math.floor(Math.random() * (waitMax - waitMin + 1)) + waitMin;
        window.setTimeout(() => {
            const version = Debug.#generateString(16, 32);
            callback(version);
        }, waitTime);
    }
}