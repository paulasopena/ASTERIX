import fs from 'fs';

export function sliceBuffer(buffer: Buffer) {
    var offset = 0;
    var messages = [];

    while (offset < buffer.length) {
        const message = buffer.readInt8(offset)
        const binaryRepresentation = message.toString(2).padStart(8, '0');
        messages.push(binaryRepresentation);
        offset += 1
    }
    return messages;
}