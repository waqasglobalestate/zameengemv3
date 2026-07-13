from PIL import Image
import sys

def make_transparent(img_path):
    try:
        img = Image.open(img_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            r, g, b, a = item
            # The grey background is usually a light color where R, G, B are very close to each other.
            # Zameen Gem logo colors are Gold (R: ~212, G: ~175, B: ~55) and Dark Green.
            if abs(r - g) < 25 and abs(r - b) < 25 and abs(g - b) < 25 and r > 180 and g > 180 and b > 180:
                newData.append((255, 255, 255, 0)) # transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(img_path, "PNG")
        print("Successfully made the background transparent.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

make_transparent("./public/images/zameen_gem_logo.png")
