import os, sys, glob
from PIL import Image

size = 1280, 720

def convert_white_to_transparent(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] == 255 and item[1] == 255 and item[2] == 255:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    return img

infiles = glob.glob('big/*png')
#outImg = Image.new('RGBA', (1280, 720 * (1+len(infiles))), (255,0,0,0))
for idx, infile in enumerate(infiles):
    outfile = os.path.split(infile)[1]
    print(infile, outfile)
    try:
        outImg = Image.new('RGBA', (size[0], size[1] * 2), (255,0,0,0))
        im = Image.open(infile)
        im = convert_white_to_transparent(im)
        im.thumbnail(size, Image.ANTIALIAS)
        # outImg.paste(im, (0, (1+idx) * 720))
        outImg.paste(im, (0, 720))
        outImg.save(outfile, "PNG")
    except IOError:
        print("cannot resize '%s'" % infile)

# outImg.save('conc.png', "PNG")
