import os, sys, glob
from PIL import Image

size = 1280, 720

infiles = glob.glob('big/*png')
#outImg = Image.new('RGBA', (1280, 720 * (1+len(infiles))), (255,0,0,0))
for idx, infile in enumerate(infiles):
    outfile = os.path.split(infile)[1]
    print(infile, outfile)
    try:
        outImg = Image.new('RGBA', (1280, 720 * 2), (255,0,0,0))
        im = Image.open(infile)
        im.thumbnail(size, Image.ANTIALIAS)
        # outImg.paste(im, (0, (1+idx) * 720))
        outImg.paste(im, (0, 720))
        outImg.save(outfile, "PNG")
    except IOError:
        print("cannot resize '%s'" % infile)

# outImg.save('conc.png', "PNG")
