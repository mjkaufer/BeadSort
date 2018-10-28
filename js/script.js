const maxIntSize = 25
const margin = 20
const beadSize = 15
const beadSpacing = beadSize + 2
const outputBuffer = 50
const dt = 0.05
const gravity = 15

function getX(lineNum) {
    return lines[lineNum].translation._x
}

function makeBead(x, y) {
    var bead = two.makeCircle(x, y, beadSize)
    bead.stroke = 'invisible'
    bead.fill = 'blue'
    return bead
}

function plotNumber(num) {
    if (isNaN(num)) {
        throw "Input is not a number"
    }

    if (num >= maxIntSize) {
        throw "Number " + num + " is greater than " + maxIntSize
    }

    if (num <= 0) {
        throw "Number must be positive!"
    }

    var y = height - (margin + (beadSize + beadSpacing) * numbers.length)

    if (y <= margin) {
        throw "Too many numbers"
    }

    var beads = []

    for (var i = 0; i < num; i++) {
        var bead = makeBead(getX(i), y)
        bead.dy = 0
        beads.push(bead)
    }

    var text = two.makeText(num, innerWidth - outputBuffer, y)

    numbers.push({
        value: num,
        beads,
        text
    })

    two.update()
}

function computeDrops() {
    var dropTable = []
    for (var i = 0; i < numbers.length; i++) {
        dropTable.push([])
        for (var j = 0; j < maxIntSize; j++) {
            dropTable[i].push([0, false])
        }
    }

    for (var i = 0; i < numbers.length; i++) {
        var currentNum = numbers[i].value
        for (var j = 0; j < currentNum; j++) {
            if (i == 0) {
                dropTable[i][j] = [0, true]  
            } else {
                dropTable[i][j] = dropTable[i - 1][j]
                if (dropTable[i][j][1] === false) {
                    dropTable[i][j] = [dropTable[i][j][0], true]
                }

                numbers[i].beads[j].dy = dropTable[i][j][0] * (beadSize + beadSpacing)
            }
        }
        for (var j = currentNum; j < maxIntSize; j++) {
            if (i != 0) {
                // if (dropTable[i-1][j][1] === true) {
                //     dropTable[i][j] = [dropTable[i-1][j][0] + 1, false]    
                // } else {
                //     dropTable[i][j] = [dropTable[i-1][j][0] + 1, false]
                // }
                dropTable[i][j] = [dropTable[i-1][j][0] + 1, false]
            } else {
                dropTable[i][j] = [1, false]
            }
        }
    }

    return dropTable
}

function sort() {
    dropBeads(updateNumbers)
}

function updateNumbers() {
    // ok this is kinda shitty
    // but rather than count the beads in each row like a fool
    // (which is still feasible)
    // we're just gonna sort our input and write the final numbers like that
    // lol

    var sortedNumbers = numbers.map(function(e) {
        return e.value
    }).sort(function(a, b) {
        return b - a
    }).forEach(function(num, i) {
        numbers[i].text.value = num
    })

    two.update()

}

function dropBeads(callback) {
    isSorting = true
    var dropTable = computeDrops()
    var dy = beadSize + beadSpacing
    var t = dt

    interval = setInterval(function() {
        var delta = gravity * Math.pow(t, 2)
        var anyDrops = false
        for (var i = 0; i < numbers.length; i++) {
            var beads = numbers[i].beads
            for (var j = 0; j < beads.length; j++) {
                if (beads[j].dy > 0) {
                    anyDrops = true
                    var currentDelta = delta
                    if (beads[j].dy - currentDelta < 0) {
                        currentDelta = beads[j].dy
                    }

                    beads[j].dy -= currentDelta
                    beads[j].translation.y += currentDelta
                }
            }
        }
        two.update()
        if (!anyDrops) {
            clearInterval(interval)
            callback()
        }
        t += dt
    }, 1000*dt)
}

function makeLines() {
    var innerWidth = width - margin * 2 - outputBuffer
    var lines = []

    // need to center if the max int size doesn't divide the page width prettily
    var maxX = parseInt(innerWidth / maxIntSize) * (maxIntSize - 1)
    var bonusMargin = (innerWidth - maxX) / 2

    for (var i = 0; i < maxIntSize; i++) {
        var x = parseInt(innerWidth / maxIntSize) * i + margin + bonusMargin
        var y = 0
        lines.push(two.makeLine(x, y, x, height))
    }
    two.update()
    return lines
}

var lines, numbers, elem, width, height, two, interval, isSorting


function reset() {
    isSorting = false
    clearInterval(interval)
    document.getElementById('two').innerHTML = ''
    lines = []
    elem = document.getElementById('two')
    width = document.body.offsetWidth
    height = document.body.offsetHeight
    two = new Two({width, height}).appendTo(elem)

    /*
        {
            value: int,
            beads: [array of beads]
        }
    */
    numbers = []
    lines = makeLines()
    two.update()
}

reset()

const input = document.getElementById('numInput')

function addNumber() {
    if (isSorting) {
        reset()
    }
    var number = parseInt(input.value)
    input.value = ""
    plotNumber(number)
}

input.onkeydown = function(e) {
    if (e.keyCode == 13) {
        addNumber()
    }
}

document.getElementById('addNumber').onclick = addNumber
document.getElementById('sort').onclick = sort
document.getElementById('reset').onclick = reset
window.onresize = reset