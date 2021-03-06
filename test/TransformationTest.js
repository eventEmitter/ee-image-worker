/**
 * The following tests are intended to cover errors in the concrete implementation of the transformations
 * and are not able to fully test the desired results.
 */

var   assert            = require('assert')
    , fs                = require('fs')
    , log               = require('ee-log')
    , path              = require('path')
    , picha             = require('picha')
    , PichaEngine       = require('../lib/engine/picha/Engine')

    , Transformation    = require('../lib/Transformation');

var engine = new PichaEngine();

var images = {
      'jpg' : fs.readFileSync(path.join(__dirname, 'resources/band.jpg'))
    , 'png' : fs.readFileSync(path.join(__dirname, 'resources/band.png'))
    , 'tiff' : fs.readFileSync(path.join(__dirname, 'resources/band.tiff'))
    , 'webp' : fs.readFileSync(path.join(__dirname, 'resources/band.webp'))
};

var assertMime = function(err, result, expected, done){
    assert(!err);
    assert.equal(picha.stat(result).mimetype, expected);
    done();
};

var testEncoding = function(buffer, to, expected, done){
    var transformation  = new Transformation(engine);
    transformation.encode(to);
    transformation.applyTo(buffer, function(err, result){
        assertMime(err, result, expected, done);
    });
};

describe('Transformation', function(){

    describe('Test setup', function(){
        it('all testfiles should be recognizeable by the engine', function(){
            assert(picha.stat(images.jpg).mimetype, 'image/jpeg');
            assert(picha.stat(images.png).mimetype, 'image/png');
            assert(picha.stat(images.tiff).mimetype, 'image/webp');
            assert(picha.stat(images.webp).mimetype, 'image/tiff');
        });

        it('Transformation should be instantiable', function(){
            new Transformation();
        });
    });

    describe('encode', function(){
        var transformation  = new Transformation(engine);
        var query = transformation.encode('png');

        it.skip('should return a closure instead of the original transformation which only has an applyTo method', function(){
            assert(query !== transformation);
            assert.deepEqual(Object.keys(query), ['applyTo']);
        });

        it('should add a stage to the pipeline (blackbox!)', function(){
            assert.equal(transformation.pipeline.length, 1);
        });

        it('should work out for different image types (webp -> tiff) also if no complete mietype is specified', function(done){
            testEncoding(images.webp, 'tiff', 'image/tiff', done);
        });

        it('should fallback to the initial image type', function(done){
            testEncoding(images.png, null, 'image/png', done);
        });

        it('should throw an error if one aplies multiple encodings', function(){
            assert.throws(function(){
               transformation.encode('jpg');
            });
        });
    });

    describe('toTiff', function(){
        it('is a shortcode for encoding as tiff and applying', function(done){
            new Transformation(engine).toTiff(images.png, null, function(err, result){
                assertMime(err, result, 'image/tiff', done);
            });
        });
    });

    describe('toPng', function(){
        it('is a shortcode for encoding as png and applying', function(done){
            new Transformation(engine).toPng(images.tiff, null, function(err, result){
                assertMime(err, result, 'image/png', done);
            });
        });
    });

    describe('toJpeg', function(){
        it('is a shortcode for encoding as jpg and applying', function(done){
            new Transformation(engine).toJpeg(images.jpg, null, function(err, result){
                assertMime(err, result, 'image/jpeg', done);
            });
        });
    });

    describe('toWebp', function(){
        it('is a shortcode for encoding as webp and applying', function(done){
            new Transformation(engine).toWebp(images.jpg, null, function(err, result){
                assertMime(err, result, 'image/webp', done);
            });
        });
    });

    describe('applyTo', function(){
        it('should apply encoding', function(done){
            testEncoding(images.jpg, 'image/png', 'image/png', done);
        });

        it('should add a default encoding (and preserve the image type) if there is no encoding set (see crop)', function(done){
            var transformation = new Transformation(engine);
            transformation.crop(600, 600).applyTo(images.png, function(err, result){
                assert(!err);
                var stats = picha.stat(result);
                assert.equal(stats.mimetype, 'image/png');
                done();
            });
        });
    });

    describe('crop', function(){
        it.skip('should normalize the parameters', function(done){
            var transformation = new Transformation(engine);
            transformation.crop(-100, 100).applyTo(images.jpg, function(err, result){
                assert(err);
                /*var stats = picha.stat(result);
                assert.equal(stats.width, '1720');
                assert.equal(stats.height, '880');*/
                done();
            });
        });

        it('should take all parameters into account if set also if its a string', function(done){
            var transformation = new Transformation(engine);
            transformation.crop(100, '200', {right: '200', bottom: 200}).applyTo(images.jpg, function(err, result){
                assert(!err);
                var stats = picha.stat(result);
                assert.equal(stats.width, 100);
                assert.equal(stats.height, 200);
                done();
            });
        });
    });

    describe('scale', function(){
        it.skip('should have some tests!');
    });
});