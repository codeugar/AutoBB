interface SkeletonProps {
  width?: string
  height?: string
  className?: string
  rounded?: boolean
}

const Skeleton = ({ width = '100%', height = '16px', className = '', rounded = false }: SkeletonProps) => {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
    />
  )
}

export default Skeleton
