/* eslint-disable indent */
/* eslint-disable linebreak-style */
export default function createSkeleton(height, width) {
    const skeleton = document.createElement('div');
    skeleton.style.height = height;
    skeleton.style.width = width;
    skeleton.className = 'skeleton';

    return skeleton;
}
