import pandas as pd
import re

pattern = re.compile('\"')

def findNextQuote(line, startPos, insideField):

    linelen = len(line)
    
    while startPos < linelen - 1:

        # Search for the quote character
        mo = pattern.search(line, startPos)
        
        if not mo:
            return None
        else:
            quoteLocation = mo.start()
            
            if insideField:
                if (quoteLocation + 1 < linelen) and (line[quoteLocation + 1] == '\"'):
                    # Skip over double quotes within a field
                    if (quoteLocation + 2 < linelen):
                         startPos = quoteLocation + 2
                    else:
                        # End of line
                        return None
                else:
                    # End of field
                    return quoteLocation
            else:
                # Normal case: return quoteLocation
                # Empty field: return the quoteLocation and let the calling
                # function handle this scenario
                return quoteLocation


fieldsToRead = 6
fields = [None] * fieldsToRead
fieldsRead = 0
insideField = False
currentField = ''
fieldStartPos = 0


with open('enron.csv') as inputFile:

    with open('enron_canonicalized.csv', 'w') as outputFile:

        line = inputFile.readline()

        while line:
            #print(line)
            linelen = len(line)
            quoteSearchLocation = 0

            while True:
                nextQuoteLoc = findNextQuote(line, quoteSearchLocation, insideField)

                if nextQuoteLoc == None:
                    if insideField:
                        # Case: Started reading a field and reached the end of
                        # the line
                        #print('Reading to end of field')
                        temp = line[fieldStartPos:].rstrip('\n')
                        temp += ' '
                        currentField += temp
                        fieldStartPos = 0
                    break
                else:
                    if insideField:
                        # Case: Found an enclosing quote, so read the field
                        currentField += line[fieldStartPos:nextQuoteLoc]
                        #print('Found field: ', currentField)
                        fields[fieldsRead] = '"' + currentField + '"'
                        currentField = ''
                        fieldsRead += 1
                        insideField = False
                    else:
                        if (nextQuoteLoc + 2 < linelen) and (line[nextQuoteLoc + 1] == '\"') and (line[nextQuoteLoc + 2] == '\"'):
                            # Case: Encountered a quote character at the start
                            # of a field
                            #print('Quote at the start of a field')
                            fieldStartPos = nextQuoteLoc + 1
                            nextQuoteLoc += 2
                            insideField = True
                        elif (nextQuoteLoc + 1 < linelen) and (line[nextQuoteLoc + 1] == '\"'):
                            # Case: Encountered an empty field
                            #print('Empty field')
                            fields[fieldsRead] = '""'
                            currentField = ''
                            fieldsRead += 1
                            nextQuoteLoc += 1
                        else:
                            # Case: Found a quote character to start a field
                            #print('Starting a field')
                            fieldStartPos = nextQuoteLoc + 1
                            insideField = True

                if nextQuoteLoc + 1 < linelen:
                    # Move the quoteSearchLocation past the quote
                    quoteSearchLocation = nextQuoteLoc + 1
                else:
                    # Reached the end of the line
                    break

                if fieldsRead == fieldsToRead:
                    #print(','.join(fields))
                    outputFile.write(','.join(fields) + '\n')
                    fieldsRead = 0

            line = inputFile.readline()
