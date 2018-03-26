import React, { Component } from 'react'
import { Motion, spring } from 'react-motion'

const Fragment = React.Fragment || 'div'

const clamp = (n, min, max) => {
  return Math.max(Math.min(n, max), min)
}

class Stunter extends Component {

  static defaultProps = {
    springConfig: { stiffness: 1600, damping: 80 },
    threshold: 200,
    renderCount: 3,
    infinite: true,
    onSwipeEnd: () => {}
  }

  state = {
    topDeltaX: 0,
    mouseX: 0,
    isPressed: false,
    pressedId: null,
    swiped: false,
    swipedId: null,
    direction: null,
    data: this.props.data
  }

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove)
    window.addEventListener('touchend', this.handleMouseUp)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  componentWillUnMount() {
    window.removeEventListener('touchmove', this.handleTouchMove)
    window.removeEventListener('touchend', this.handleMouseUp)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseDown = (id, pressX, { pageX }) => {
    if (this.el) {
      this.setState(prevState => ({
        topDeltaX: pageX - pressX,
        mouseX: pressX,
        isPressed: !prevState.swiped,
        pressedId: id
      }))
    }
  }

  handleMouseMove = ({ pageX }) => {
    if (this.el) {
      const { isPressed, topDeltaX, pressedId } = this.state
      const { threshold } = this.props
      if (isPressed) {
        const mouseX = pageX - topDeltaX;
        this.setState({ mouseX })
        if (Math.abs(mouseX) > threshold) {
          this.handleSwipe(mouseX, pressedId)
        }
      }
    }
  }

  handleMouseUp = () => {
    if (this.el) {
      setTimeout(() => {
        this.setState({
          isPressed: false,
          topDeltaX: 0,
          mouseX: 0
        })
      }, 300)
    }
  }

  handleTouchStart = (id, pressLocation, e) => {
    if (this.el) {
      this.handleMouseDown(id, pressLocation, e.touches[0])
    }
  }

  handleTouchMove = e => {
    e.preventDefault();
    if (this.el) {
      this.handleMouseMove(e.touches[0])
    }
  }

  handleSwipe = (x, id) => {
    if (x < 0) {

      let dislike = document.createElement('div')
      dislike.classList.add('dislike')
      dislike.innerHTML = 'Dislike!'
      let elem = document.querySelectorAll('.stunter-card-item')[0]
      elem.appendChild(dislike)      

    } else {

      let like = document.createElement('div')
      like.classList.add('like')
      like.innerHTML = 'Like!'
      let elem = document.querySelectorAll('.stunter-card-item')[0]
      elem.appendChild(like)      

    }

    setTimeout(() => {

      this.setState({
        swiped: true,
        direction: x > 0 ? 'right' : 'left',
        swipedId: id
      }, () => {

      })      

    }, 300)
  }

  accept = () => {
    let like = document.createElement('div')
    like.classList.add('like')
    like.innerHTML = 'Like!'
    let elem = document.querySelectorAll('.stunter-card-item')[0]
    elem.appendChild(like)
    setTimeout(() => this.handleSwipe(1, this.state.data[0].id), 300)
  }

  reject = () => {
    let dislike = document.createElement('div')
    dislike.classList.add('dislike')
    dislike.innerHTML = 'Dislike!'
    let elem = document.querySelectorAll('.stunter-card-item')[0]
    elem.appendChild(dislike)
    setTimeout(() => this.handleSwipe(-1, this.state.data[0].id), 300)
  }

  handleRemove = id => {
    this.setState(({ data }) => ({
      data: data.filter(item => item.id !== id),
      swipedId: null,
      mouseX: 0,
      swiped: false
    }))

    this.props.onSwipeEnd(this.state)
  }

  shuffle = id => {
    this.setState(({ data }) => {
      data.push(data.shift());
      return {
        data,
        swipedId: null,
        mouseX: 0,
        swiped: false
      }
    })

    this.props.onSwipeEnd(this.state)
  }

  getStyle = (id, i) => {
    const {
      isPressed,
      mouseX,
      direction,
      swiped,
      swipedId,
      pressedId
    } = this.state

    const { springConfig, threshold } = this.props

    const isSecond = !isPressed
      ? i === 1 && swiped ? 1 : 0.5
      : clamp(1 * Math.abs(mouseX) / threshold, 0.5, 1)

    const nextOpacity = i > 1 ? 0 : 1

    const next = {
      scale: spring(isSecond, springConfig),
      shadow: spring(0, springConfig),
      rotate: spring(0, springConfig),
      opacity: spring(nextOpacity, springConfig),
      x: spring(0, springConfig)
    }

    const first = {
      ...next,
      scale: spring(1, springConfig),
      opacity: spring(1, springConfig)
    }

    const pan = {
      scale: spring(1.1, springConfig),
      shadow: spring(16, springConfig),
      opacity: spring(
        clamp(1 / (Math.abs(mouseX) / 100) + 0.5, 0, 1),
        springConfig
      ),
      rotate: clamp(mouseX / 15, -45, 45),
      x: mouseX
    }

    const finish = {
      ...pan,
      rotate: spring(direction === 'left' ? -45 : 45, springConfig),
      opacity: spring(0, springConfig),
      x: spring(direction === 'left' ? -360 : 360, springConfig)
    };

    return swiped && swipedId === id
      ? finish
      : pressedId === id && isPressed ? pan : i < 1 ? first : next
  }

  render() {
    const { swipedId, data } = this.state
    const { renderCount, renderButtons } = this.props

    return (
      <Fragment>
        <div className="stunter-card-stack" ref={el => (this.el = el)}>
          {data.map(
            ({ id, ...rest }, i) =>
              i < renderCount && (
                <Motion
                  key={id}
                  style={this.getStyle(id, i)}
                  onRest={() => {
                    const action = this.props.infinite
                      ? this.shuffle
                      : this.handleRemove

                    swipedId === id && action(swipedId)
                  }}
                >
                  {({ scale, shadow, x, rotate, opacity }) => {
                    return (
                      <div
                        className="stunter-card-item"
                        onMouseDown={this.handleMouseDown.bind(null, id, x)}
                        onTouchStart={this.handleTouchStart.bind(null, id, x)}
                        children={this.props.render({ id, ...rest })}
                        style={{
                          boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${shadow}px 0px`,
                          opacity,
                          transform: `translate3d(${x}px, 0, 0) scale(${scale}) rotate(${rotate}deg)`,
                          zIndex: data.length - i
                        }}
                      />
                    );
                  }}
                </Motion>
              )
          )}
        </div>

        {renderButtons &&
          renderButtons({ accept: this.accept, reject: this.reject })}
      </Fragment>
    );
  }
}

export default Stunter